# Add a read-only view

Read views.json and the existing SQL views. Translate the requested question into a SELECT, keeping currency and cash separate from pledges. Add a view through a new numbered migration if needed. Register its sections in views.json. Run npm test and npm run view. Open the resulting HTML and check it against the CLI. Never add a web server, login screen or write action to a view.
