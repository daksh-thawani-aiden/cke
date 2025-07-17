import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { DecoupledEditor, AutoLink, Autosave, Bold, CloudServices, Essentials, Italic, Link, Mention, Paragraph } from 'ckeditor5';
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
  TrackChangesPreview
} from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
import './App.css';

// Replace with your actual license key from CKEditor
const LICENSE_KEY = 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NTM4MzM1OTksImp0aSI6ImM0Y2Y4NjA1LTk0OTYtNGFlYS1iYzIxLTdmODRiZjZjMzgzZCIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjY0ZGUzYTRkIn0.c6JOt9peY1dlGUDHrkP-lhUM3rbmo-McT3aw0LvqEVZNyiLXBhjl5Vd6iVUrUNa8S501645KScA5xZMdQIY2gA';

// Replace with your real document ID (e.g., from DB or route param)
const DOCUMENT_ID = 'doc-1234';

const CLOUD_SERVICES_TOKEN_URL =
  'https://8iaaa_rjqdhw.cke-cs.com/token/dev/a216161b5440455a8394af71f071c57c9a4e138b4fc60ca61db95f0871f2?limit=10';
const CLOUD_SERVICES_WEBSOCKET_URL = 'wss://8iaaa_rjqdhw.cke-cs.com/ws';

export default function App() {
  const editorPresenceRef = useRef(null);
  const editorContainerRef = useRef(null);
  const editorToolbarRef = useRef(null);
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null); // Store CKEditor instance
  const editorAnnotationsRef = useRef(null);
  const editorRevisionHistoryRef = useRef(null);
  const editorRevisionHistoryEditorRef = useRef(null);
  const editorRevisionHistorySidebarRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [user, setUser] = useState(null); // Start as null, not default

  // Receive Unqork user info via postMessage
  useEffect(() => {
    function handleMessage(event) {
      if (event.data?.type === 'setUser') {
        const { id, name, avatar } = event.data.user || {};
        if (id && name) {
          setUser({ id, name, avatar });
        }
      }
      // Handle if Unqork ever needs to send other message types
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Set editor content from Unqork
  useEffect(() => {
    function handleSetDataMessage(event) {
      if (event.data && event.data.type === 'setData') {
        if (editorInstanceRef.current) {
          editorInstanceRef.current.setData(event.data.data);
        }
      }
    }
    window.addEventListener('message', handleSetDataMessage);
    return () => window.removeEventListener('message', handleSetDataMessage);
  }, []);

  // Send Editor Changes Back to Unqork
  useEffect(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return;
    const handleChange = () => {
      if (!window.parent || !editor.isReadOnly) return; // Only if not read-only
      const data = editor.getData();
      try {
        window.parent.postMessage(
          { type: 'editorData', data },
          '*' // Allows any parent; use your Unqork domain for tighter security if needed
        );
      } catch (e) {
        console.warn('[Iframe] Failed to postMessage to parent:', e);
      }
    };
    editor.model.document.on('change', handleChange);
    return () => {
      editor.model.document.off('change', handleChange);
    };
  }, [editorInstanceRef.current]);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady || !user) return {};
    return {
      editorConfig: {
        toolbar: {
          items: ['undo', 'redo', '|', 'revisionHistory', 'trackChanges', 'comment', 'commentsArchive', '|', 'bold', 'italic', '|', 'link'],
          shouldNotGroupWhenFull: false
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
          TrackChangesPreview
        ],
        cloudServices: {
          tokenUrl: CLOUD_SERVICES_TOKEN_URL,
          webSocketUrl: CLOUD_SERVICES_WEBSOCKET_URL
        },
        collaboration: {
          channelId: DOCUMENT_ID
        },
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        comments: {
          editorConfig: {
            extraPlugins: [Bold, Italic, Mention],
            mention: {
              feeds: [
                {
                  marker: '@',
                  feed: []
                }
              ]
            }
          }
        },
        initialData: '<h2>Welcome to the collaborative CKEditor!</h2><p>Start editing...</p>',
        licenseKey: LICENSE_KEY,
        autosave: {
          save() {
            if (editorInstanceRef.current) {
              const data = editorInstanceRef.current.getData();
              console.log('Autosave:', data);
              // TODO: send data to backend here
            }
          }
        },
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: 'https://',
          decorators: {
            toggleDownloadable: {
              mode: 'manual',
              label: 'Downloadable',
              attributes: {
                download: 'file'
              }
            }
          }
        },
        mention: {
          feeds: [
            {
              marker: '@',
              feed: []
            }
          ]
        },
        placeholder: 'Type or paste your content here!',
        presenceList: {
          container: editorPresenceRef.current
        },
        revisionHistory: {
          editorContainer: editorContainerRef.current,
          viewerContainer: editorRevisionHistoryRef.current,
          viewerEditorElement: editorRevisionHistoryEditorRef.current,
          viewerSidebarContainer: editorRevisionHistorySidebarRef.current,
          resumeUnsavedRevision: true
        },
        sidebar: {
          container: editorAnnotationsRef.current
        }
      }
    };
  }, [isLayoutReady, user]);

  // Warn user if there are unsaved changes (PendingActions plugin)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (editorInstanceRef.current) {
        const pendingActions = editorInstanceRef.current.plugins?.get?.('PendingActions');
        if (pendingActions && pendingActions.hasAny) {
          e.preventDefault();
          e.returnValue = '';
          return '';
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleManualSave = () => {
    if (editorInstanceRef.current) {
      const data = editorInstanceRef.current.getData();
      console.log('Manual save:', data);
      // TODO: send data to backend here
    }
  };

  return (
    <div className="main-container">
      <div className="presence" ref={editorPresenceRef}></div>
      <div className="editor-container editor-container_document-editor editor-container_include-annotations" ref={editorContainerRef}>
        <div className="editor-container__toolbar" ref={editorToolbarRef}></div>
        <div className="editor-container__editor-wrapper">
          <div className="editor-container__editor">
            <div ref={editorRef}>
              {editorConfig && Object.keys(editorConfig).length > 0 ? (
                <CKEditor
                  onReady={editor => {
                    editorToolbarRef.current.appendChild(editor.ui.view.toolbar.element);
                    editorInstanceRef.current = editor;
                  }}
                  onAfterDestroy={() => {
                    Array.from(editorToolbarRef.current.children).forEach(child => child.remove());
                    editorInstanceRef.current = null;
                  }}
                  editor={DecoupledEditor}
                  config={editorConfig}
                />
              ) : (
                <div>Loading editor...</div>
              )}
            </div>
          </div>
          <div className="editor-container__sidebar" ref={editorAnnotationsRef}></div>
        </div>
      </div>
      <div className="revision-history" ref={editorRevisionHistoryRef}>
        <div className="revision-history__wrapper">
          <div className="revision-history__editor" ref={editorRevisionHistoryEditorRef}></div>
          <div className="revision-history__sidebar" ref={editorRevisionHistorySidebarRef}></div>
        </div>
      </div>
      <button onClick={handleManualSave} style={{marginTop: 16}}>Manual Save</button>
    </div>
  );
}
