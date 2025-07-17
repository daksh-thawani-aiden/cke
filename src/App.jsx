import { useState, useEffect, useRef, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  DecoupledEditor,
  AutoLink,
  Autosave,
  Bold,
  CloudServices,
  Essentials,
  Italic,
  Link,
  Mention,
  Paragraph,
} from "ckeditor5";
import {
  Comments,
  PresenceList,
  RealTimeCollaborativeComments,
  RealTimeCollaborativeEditing,
  RealTimeCollaborativeRevisionHistory,
  RealTimeCollaborativeTrackChanges,
  RevisionHistory,
  TrackChanges,
  TrackChangesData,
  TrackChangesPreview,
} from "ckeditor5-premium-features";

import "ckeditor5/ckeditor5.css";
import "ckeditor5-premium-features/ckeditor5-premium-features.css";
import "./App.css";

// ---
// HARDCODED CONFIG (for maximum clarity/debuggability)
// ---

const LICENSE_KEY =
  "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NTM4MzM1OTksImp0aSI6ImM0Y2Y4NjA1LTk0OTYtNGFlYS1iYzIxLTdmODRiZjZjMzgzZCIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjY0ZGUzYTRkIn0.c6JOt9peY1dlGUDHrkP-lhUM3rbmo-McT3aw0LvqEVZNyiLXBhjl5Vd6iVUrUNa8S501645KScA5xZMdQIY2gA";
const DOCUMENT_ID = "doc-1234";
const CLOUD_SERVICES_TOKEN_URL =
  "https://8iaaa_rjqdhw.cke-cs.com/token/dev/a216161b5440455a8394af71f071c57c9a4e138b4fc60ca61db95f0871f2?limit=10";
const CLOUD_SERVICES_WEBSOCKET_URL = "wss://8iaaa_rjqdhw.cke-cs.com/ws";

// ALLOWED PARENT ORIGINS (hardcoded for testing)
const ALLOWED_PARENT_ORIGINS = [
  "https://aiden-ai-stagingx.unqork.io",
  "https://aiden-ai-staging.unqork.io",
];
const ALLOWED_ORIGIN_FOR_POSTMESSAGE = "*"; // 'https://aiden-ai-stagingx.unqork.io' for production, '*' for debug

console.log("[Iframe] Ready. Allowed parent origins:", ALLOWED_PARENT_ORIGINS);

export default function App() {
  const editorPresenceRef = useRef(null);
  const editorContainerRef = useRef(null);
  const editorToolbarRef = useRef(null);
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const editorAnnotationsRef = useRef(null);
  const editorRevisionHistoryRef = useRef(null);
  const editorRevisionHistoryEditorRef = useRef(null);
  const editorRevisionHistorySidebarRef = useRef(null);
  const [user, setUser] = useState(null);
  const [content, setContent] = useState("<p>Loading editor...</p>");
  const [status, setStatus] = useState("Waiting for messages...");

  // ---
  // Handle ALL incoming messages from Unqork (setUser, setData, etc.)
  // ---

  useEffect(() => {
    function handleMessage(event) {
      try {
        console.log("[Iframe] Received message from:", event.origin, event.data);
        if (event.data?.type === "setUser") {
          const { id, name, avatar } = event.data.user || {};
          if (id && name) {
            console.log("[Iframe] Setting user:", { id, name, avatar });
            setUser({ id, name, avatar });
            setStatus("User info received");
          }
        }
        if (event.data?.type === "setData" && editorInstanceRef.current) {
          console.log("[Iframe] Received content:", event.data.data);
          editorInstanceRef.current.setData(event.data.data);
          setStatus("Content received");
        }
      } catch (e) {
        console.error("[Iframe] Error handling message:", e);
      }
    }
    console.log("[Iframe] Adding message listener for parent");
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // ---
  // Send editor changes back to Unqork
  // ---

  const sendUpdateToParent = (data) => {
    if (!window.parent) return;
    try {
      console.log("[Iframe] Sending to parent:", {
        type: "editorData",
        data,
      });
      window.parent.postMessage(
        { type: "editorData", data },
        ALLOWED_ORIGIN_FOR_POSTMESSAGE
      );
      setStatus("Sent content to parent");
    } catch (e) {
      console.error("[Iframe] Failed to postMessage to parent:", e);
      setStatus("Failed to send to parent");
    }
  };

  useEffect(() => {
    if (!editorInstanceRef.current) return;
    const editor = editorInstanceRef.current;
    const handleChange = () => {
      const data = editor.getData();
      setContent(data);
      sendUpdateToParent(data);
    };
    editor.model.document.on("change", handleChange);
    return () => {
      editor.model.document.off("change", handleChange);
    };
  }, []);

  // ---
  // Editor config: basic until user arrives, then full featured
  // ---

  const editorConfig = useMemo(() => {
    const baseConfig = {
      initialData: "<p>Loading editor...</p>",
      toolbar: { items: [], shouldNotGroupWhenFull: false },
      placeholder: "Waiting for connection...",
      cloudServices: {
        tokenUrl: CLOUD_SERVICES_TOKEN_URL,
        webSocketUrl: CLOUD_SERVICES_WEBSOCKET_URL,
      },
      licenseKey: LICENSE_KEY,
    };
    if (!user)
      return {
        ...baseConfig,
        plugins: [AutoLink, Essentials, Paragraph],
        autosave: {
          save: () => {
            const data = editorInstanceRef.current?.getData();
            console.log("Autosave:", data);
          },
        },
      };
    return {
      ...baseConfig,
      toolbar: {
        items: [
          "undo",
          "redo",
          "|",
          "revisionHistory",
          "trackChanges",
          "comment",
          "commentsArchive",
          "|",
          "bold",
          "italic",
          "|",
          "link",
        ],
        shouldNotGroupWhenFull: false,
      },
      plugins: [
        AutoLink,
        Autosave,
        Bold,
        CloudServices,
        Comments,
        Essentials,
        Italic,
        Link,
        Mention,
        Paragraph,
        PresenceList,
        RealTimeCollaborativeComments,
        RealTimeCollaborativeEditing,
        RealTimeCollaborativeRevisionHistory,
        RealTimeCollaborativeTrackChanges,
        RevisionHistory,
        TrackChanges,
        TrackChangesData,
        TrackChangesPreview,
      ],
      collaboration: { channelId: DOCUMENT_ID },
      user: user,
      comments: {
        editorConfig: {
          extraPlugins: [Bold, Italic, Mention],
          mention: {
            feeds: [
              {
                marker: "@",
                feed: [],
              },
            ],
          },
        },
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: "https://",
        decorators: {
          toggleDownloadable: {
            mode: "manual",
            label: "Downloadable",
            attributes: {
              download: "file",
            },
          },
        },
      },
      mention: {
        feeds: [
          {
            marker: "@",
            feed: [],
          },
        ],
      },
      placeholder: "Type or paste your content here!",
      presenceList: { container: editorPresenceRef.current },
      revisionHistory: {
        editorContainer: editorContainerRef.current,
        viewerContainer: editorRevisionHistoryRef.current,
        viewerEditorElement: editorRevisionHistoryEditorRef.current,
        viewerSidebarContainer: editorRevisionHistorySidebarRef.current,
        resumeUnsavedRevision: true,
      },
      sidebar: { container: editorAnnotationsRef.current },
    };
  }, [user]);

  // ---
  // Warn on unsaved changes
  // ---

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (editorInstanceRef.current) {
        const pendingActions = editorInstanceRef.current.plugins?.get?.(
          "PendingActions"
        );
        if (pendingActions && pendingActions.hasAny) {
          e.preventDefault();
          e.returnValue = "";
          return "";
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleManualSave = () => {
    if (editorInstanceRef.current) {
      const data = editorInstanceRef.current.getData();
      console.log("Manual save:", data);
      sendUpdateToParent(data);
    }
  };

  // ---
  // Render
  // ---

  return (
    <div className="main-container">
      <div className="presence" ref={editorPresenceRef}></div>
      <div
        className="editor-container editor-container_document-editor editor-container_include-annotations"
        ref={editorContainerRef}
      >
        <div className="editor-container__toolbar" ref={editorToolbarRef}></div>
        <div className="editor-container__editor-wrapper">
          <div className="editor-container__editor">
            <div ref={editorRef}>
              <CKEditor
                onReady={(editor) => {
                  console.log("[Iframe] Editor ready");
                  if (editorToolbarRef.current) {
                    editorToolbarRef.current.appendChild(
                      editor.ui.view.toolbar.element
                    );
                  }
                  editorInstanceRef.current = editor;
                  setStatus("Editor ready");
                }}
                editor={DecoupledEditor}
                config={editorConfig}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="revision-history" ref={editorRevisionHistoryRef}>
        <div className="revision-history__wrapper">
          <div
            className="revision-history__editor"
            ref={editorRevisionHistoryEditorRef}
          ></div>
          <div
            className="revision-history__sidebar"
            ref={editorRevisionHistorySidebarRef}
          ></div>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: 8, background: "#f0f0f0", borderRadius: 4 }}>
        <strong>Status:</strong> <span>{status}</span><br/>
        <strong>User:</strong> <span>{user?.name || "Not set"}</span>
      </div>
      {user && (
        <button onClick={handleManualSave} style={{ marginTop: 16 }}>
          Manual Save
        </button>
      )}
    </div>
  );
}
