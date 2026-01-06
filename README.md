<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This project has been updated to Angular 18.

View your app in AI Studio: https://ai.studio/apps/drive/18_LFsCNNH60Tzi4X6U37bWCNxFSfRBUa

## Run Locally

**Prerequisites:**

*   **Node.js:** This project requires Node.js version `24.12.0` or higher. We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage your Node.js versions.

    To install `nvm`, run the following command:
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    ```

    Once `nvm` is installed, you can install and use the required Node.js version:
    ```bash
    nvm install 24.12.0
    nvm use 24.12.0
    ```

**Setup:**

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set Gemini API Key:**
    Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
3.  **Run the app:**
    ```bash
    npm run dev
    ```
