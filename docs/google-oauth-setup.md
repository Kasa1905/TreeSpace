# Google OAuth Setup

TreeSpace uses `chrome.identity.getAuthToken()` from the MV3 background service worker. The effective manifest contains:

```json
{
  "permissions": ["identity", "storage"],
  "host_permissions": ["https://www.googleapis.com/*"],
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/drive.metadata.readonly"
    ]
  }
}
```

## Google Cloud configuration

1. Create or select a Google Cloud project.
2. Enable the **Google Drive API**.
3. Configure the Google Auth Platform branding and consent screen.
4. Add `https://www.googleapis.com/auth/drive.metadata.readonly` to the configured data-access scopes.
5. For an External app still in testing, add the Google accounts that will test TreeSpace as test users.
6. Create an OAuth client with application type **Chrome Extension**.
7. Set the OAuth client's **Item ID** to the TreeSpace extension ID.

The Chrome Extension client ID is public application configuration, not a client secret. TreeSpace does not use or store a client secret.

## Extension ID and build

Google binds a Chrome Extension OAuth client to the extension Item ID. An unpacked extension's ID is derived from its key. For a stable ID across local builds and a published extension, follow Chrome's documented consistent-ID process and keep the same manifest `key`/published package identity.

Build with the client ID supplied only in the local environment:

```sh
TREESPACE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com npm run build
```

The build substitutes the value only in `dist/manifest.json`. The repository manifest contains `__TREESPACE_GOOGLE_CLIENT_ID__`, so no client ID or secret is committed. `.env.example` documents the variable name; use a local ignored `.env` only if your shell/build setup loads it.

Load the generated `dist/` directory as an unpacked extension in Chromium. If the extension ID does not match the Item ID registered in Google Cloud, authentication will fail even when the client ID is otherwise valid.