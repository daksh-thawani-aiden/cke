import { useLayoutEffect, useRef, useMemo, useState } from 'react';
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
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
import './App.css';

const LICENSE_KEY = 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NTM4MzM1OTksImp0aSI6ImM0Y2Y4NjA1LTk0OTYtNGFlYS1iYzIxLTdmODRiZjZjMzgzZCIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjY0ZGUzYTRkIn0.c6JOt9peY1dlGUDHrkP-lhUM3rbmo-McT3aw0LvqEVZNyiLXBhjl5Vd6iVUrUNa8S501645KScA5xZMdQIY2gA';
const DOCUMENT_ID = 'doc-1234';
const CLOUD_SERVICES_TOKEN_URL =
  'https://8iaaa_rjqdhw.cke-cs.com/token/dev/a216161b5440455a8394af71f071c57c9a4e138b4fc60ca61db95f0871f2?limit=10';
const CLOUD_SERVICES_WEBSOCKET_URL = 'wss://8iaaa_rjqdhw.cke-cs.com/ws';
// CSP domains required for CKEditor cloud features:
// https://8iaaa_rjqdhw.cke-cs.com https://proxy-event.ckeditor.com
// Make sure these are present in your Content-Security-Policy connect-src directive.

const DEFAULT_USER = { id: 'anonymous', name: 'Anonymous', avatar: '' };

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
  const [refsReady, setRefsReady] = useState(false);

  useLayoutEffect(() => {
    // Wait until all refs are set
    if (
      editorPresenceRef.current &&
      editorContainerRef.current &&
      editorToolbarRef.current &&
      editorAnnotationsRef.current &&
      editorRevisionHistoryRef.current &&
      editorRevisionHistoryEditorRef.current &&
      editorRevisionHistorySidebarRef.current
    ) {
      setRefsReady(true);
    }
  }, []);

  const { editorConfig } = useMemo(() => {
    if (!refsReady) return {};
    return {
      editorConfig: {
        toolbar: {
          items: [
            'undo', 'redo', '|', 'revisionHistory', 'trackChanges', 'comment', 'commentsArchive', '|',
            'bold', 'italic', '|', 'link'
          ],
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
        user: DEFAULT_USER,
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
              // Optionally, send data to backend here
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
  }, [refsReady]);

  useLayoutEffect(() => {
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

  useLayoutEffect(() => {
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
    </div>
  );
}
