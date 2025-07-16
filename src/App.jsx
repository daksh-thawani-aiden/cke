/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/#installation/NoTgNARATAdA7DADBSU5TQVjgZhJgDgDYiBGUkHRSnPOOAqEIxTHAFh01MXWUgCmAOxQ4wwUmERSwk6aQC6kRAKIAzAgBMoEBUA=
 */

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

const LICENSE_KEY =
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NTM4MzM1OTksImp0aSI6ImM0Y2Y4NjA1LTk0OTYtNGFlYS1iYzIxLTdmODRiZjZjMzgzZCIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjY0ZGUzYTRkIn0.c6JOt9peY1dlGUDHrkP-lhUM3rbmo-McT3aw0LvqEVZNyiLXBhjl5Vd6iVUrUNa8S501645KScA5xZMdQIY2gA';

/**
 * Unique ID that will be used to identify this document. E.g. you may use ID taken from your database.
 * Read more: https://ckeditor.com/docs/ckeditor5/latest/api/module_collaboration-core_config-RealTimeCollaborationConfig.html
 */
const DOCUMENT_ID = '<YOUR_DOCUMENT_ID>';

const CLOUD_SERVICES_TOKEN_URL =
	'https://8iaaa_rjqdhw.cke-cs.com/token/dev/a216161b5440455a8394af71f071c57c9a4e138b4fc60ca61db95f0871f2?limit=10';
const CLOUD_SERVICES_WEBSOCKET_URL = 'wss://8iaaa_rjqdhw.cke-cs.com/ws';

// Default user info (will be replaced by Unqork via postMessage)
const DEFAULT_USER = {
	id: 'anonymous',
	name: 'Anonymous',
	avatar: undefined
};

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

	// User state, to be set by Unqork via postMessage
	const [user, setUser] = useState(DEFAULT_USER);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	// Listen for user info from Unqork via postMessage
	useEffect(() => {
		function handleMessage(event) {
			// Optionally, check event.origin for security
			if (event.data && event.data.type === 'setUser') {
				const { id, name, avatar } = event.data.user || {};
				if (id && name) {
					setUser({
						id,
						name,
						avatar
					});
				}
			}
		}
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, []);

	const { editorConfig } = useMemo(() => {
		if (!isLayoutReady) {
			return {};
		}

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
									feed: [
										/* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html#comments-with-mentions */
									]
								}
							]
						}
					}
				},
				initialData:
					'<h2>Congratulations on setting up CKEditor 5! 🎉</h2>\n<p>\n\tYou\'ve successfully created a CKEditor 5 project. This powerful text editor\n\twill enhance your application, enabling rich text editing capabilities that\n\tare customizable and easy to use.\n</p>\n<h3>What\'s next?</h3>\n<ol>\n\t<li>\n\t\t<strong>Integrate into your app</strong>: time to bring the editing into\n\t\tyour application. Take the code you created and add to your application.\n\t</li>\n\t<li>\n\t\t<strong>Explore features:</strong> Experiment with different plugins and\n\t\ttoolbar options to discover what works best for your needs.\n\t</li>\n\t<li>\n\t\t<strong>Customize your editor:</strong> Tailor the editor\'s\n\t\tconfiguration to match your application\'s style and requirements. Or\n\t\teven write your plugin!\n\t</li>\n</ol>\n<p>\n\tKeep experimenting, and don\'t hesitate to push the boundaries of what you\n\tcan achieve with CKEditor 5. Your feedback is invaluable to us as we strive\n\tto improve and evolve. Happy editing!\n</p>\n<h3>Helpful resources</h3>\n<ul>\n\t<li>📝 <a href="https://portal.ckeditor.com/checkout?plan=free">Trial sign up</a>,</li>\n\t<li>📕 <a href="https://ckeditor.com/docs/ckeditor5/latest/installation/index.html">Documentation</a>,</li>\n\t<li>⭐️ <a href="https://github.com/ckeditor/ckeditor5">GitHub</a> (star us if you can!),</li>\n\t<li>🏠 <a href="https://ckeditor.com">CKEditor Homepage</a>,</li>\n\t<li>🧑‍💻 <a href="https://ckeditor.com/ckeditor-5/demo/">CKEditor 5 Demos</a>,</li>\n</ul>\n<h3>Need help?</h3>\n<p>\n\tSee this text, but the editor is not starting up? Check the browser\'s\n\tconsole for clues and guidance. It may be related to an incorrect license\n\tkey if you use premium features or another feature-related requirement. If\n\tyou cannot make it work, file a GitHub issue, and we will help as soon as\n\tpossible!\n</p>\n',
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
							feed: [
								/* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
							]
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

	useEffect(() => {
		if (editorConfig) {
			configUpdateAlert(editorConfig);
		}
	}, [editorConfig]);

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

/**
 * This function exists to remind you to update the config needed for premium features.
 * The function can be safely removed. Make sure to also remove call to this function when doing so.
 */
function configUpdateAlert(config) {
	if (configUpdateAlert.configUpdateAlertShown) {
		return;
	}

	const isModifiedByUser = (currentValue, forbiddenValue) => {
		if (currentValue === forbiddenValue) {
			return false;
		}

		if (currentValue === undefined) {
			return false;
		}

		return true;
	};

	const valuesToUpdate = [];

	configUpdateAlert.configUpdateAlertShown = true;

	if (!isModifiedByUser(config.licenseKey, '<YOUR_LICENSE_KEY>')) {
		valuesToUpdate.push('LICENSE_KEY');
	}

	if (!isModifiedByUser(config.cloudServices?.tokenUrl, '<YOUR_CLOUD_SERVICES_TOKEN_URL>')) {
		valuesToUpdate.push('CLOUD_SERVICES_TOKEN_URL');
	}

	if (!isModifiedByUser(config.cloudServices?.webSocketUrl, '<YOUR_CLOUD_SERVICES_WEBSOCKET_URL>')) {
		valuesToUpdate.push('CLOUD_SERVICES_WEBSOCKET_URL');
	}

	if (valuesToUpdate.length) {
		window.alert(
			[
				'Please update the following values in your editor config',
				'to receive full access to Premium Features:',
				'',
				...valuesToUpdate.map(value => ` - ${value}`)
			].join('\n')
		);
	}
}