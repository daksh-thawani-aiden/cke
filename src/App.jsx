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

const DEFAULT_USER = {
	id: 'anonymous',
	name: 'Anonymous',
	avatar: ''
};

// Set this to your actual Unqork domain for production!
const ALLOWED_ORIGIN = 'https://aiden-ai-staging.unqork.io';

export default function App() {
	const editorPresenceRef = useRef(null);
	const editorContainerRef = useRef(null);
	const editorToolbarRef = useRef(null);
	const editorRef = useRef(null);
	const editorAnnotationsRef = useRef(null);
	const editorRevisionHistoryRef = useRef(null);
	const editorRevisionHistoryEditorRef = useRef(null);
	const editorRevisionHistorySidebarRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);
	const [user, setUser] = useState(DEFAULT_USER);

	// Receive Unqork user info via postMessage, with security and confirmation
	useEffect(() => {
		function handleMessage(event) {
			// Security: Only accept messages from allowed origin
			if (process.env.NODE_ENV === 'production' && event.origin !== ALLOWED_ORIGIN) {
				console.warn('Blocked postMessage from disallowed origin:', event.origin);
				return;
			}
			if (event.data?.type === 'setUser') {
				const { id, name, avatar } = event.data.user || {};
				if (id && name) {
					console.log('✅ Received user from Unqork:', { id, name, avatar });
					setUser({ id, name, avatar });
					// Optional: Confirm back to parent that user was set
					window.parent.postMessage(
						{ type: 'userSet', user: { id, name } },
						event.origin
					);
				}
			}
		}
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, []);

	useEffect(() => {
		setIsLayoutReady(true);
		return () => setIsLayoutReady(false);
	}, []);

	const { editorConfig } = useMemo(() => {
		if (!isLayoutReady) return {};

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

	return (
		<div className="main-container">
			<div className="presence" ref={editorPresenceRef}></div>
			<div className="editor-container editor-container_document-editor editor-container_include-annotations" ref={editorContainerRef}>
				<div className="editor-container__toolbar" ref={editorToolbarRef}></div>
				<div className="editor-container__editor-wrapper">
					<div className="editor-container__editor">
						<div ref={editorRef}>
							{editorConfig && (
								<CKEditor
									onReady={editor => {
										editorToolbarRef.current.appendChild(editor.ui.view.toolbar.element);
									}}
									onAfterDestroy={() => {
										Array.from(editorToolbarRef.current.children).forEach(child => child.remove());
									}}
									editor={DecoupledEditor}
									config={editorConfig}
								/>
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