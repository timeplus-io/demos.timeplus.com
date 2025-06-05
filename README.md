 # Timeplus Demo Showcase Project

This project showcases various demos of [Timeplus](https://timeplus.com). This document provides instructions on how to update the demo content, specifications for images, set up the development environment, and contribute to the project.

The main branch of the repo is published at https://demos.timeplus.com via Netlify. Feel free to use this repo as an example to build your own demo websites.

## Demos

This section explains how to work with the demo content and assets.

### Updating Demo Content

To update the demo content, please follow these guidelines:

*   **Locate the content files:** Identify the specific files related to the demo you wish to update. Today, all demo content are put in the `src/data/demo.ts`, a TypeScript file with markdowns and links.
*   **Modify the content:** Edit the files using your preferred code editor. Ensure your changes are clear,
concise, and align with the demo's purpose. It's recommended to reformat the demo.ts on save.
*   **Test your changes locally:** Before submitting any changes, run the development server (see "Development
Environment Setup" below) to preview and verify that your updates appear correctly and do not break any
functionality.

### Image Specifications

When adding or updating images for the demos, please adhere to the following specifications:

*   **Format:**
    *   Use **SVG** for icons and graphics that can be represented as vectors.
    *   Use **WebP** or **Optimized JPG/PNG** for photographic or complex raster images. Prioritize WebP for
its superior compression and quality characteristics.
*   **Dimensions:**
    *   Aim for dimensions appropriate for the web. Avoid overly large images that can slow down page load
times.
    *   The demo cover image should be 2:1, and the screenshots should be 4:3 ratio.

## Development Environment Setup

To set up your local development environment, follow these steps:

1.  **Prerequisites:**
    *   Ensure you have [Node.js](https://nodejs.org/) installed (which includes `npm` and `npx`).
    *   Install `pnpm` globally if you haven't already:
        ```bash
        npm install -g pnpm
        ```

2.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

3.  **Install dependencies:**
    This command will install all the necessary project dependencies defined in `pnpm-lock.yaml`.
    ```bash
    pnpm install
    ```

4.  **Run the development server:**
    This command will start the local development server, typically watching for file changes and enabling hot
reloading.
    ```bash
    pnpm run dev
    ```
    Once the server is running, you should be able to view the project in your web browser, usually at an
address like `http://localhost:3000` or `http://localhost:5173`.

## Contributing

We welcome and encourage contributions to refine and improve our demos!

## Publishing

The live site is automatically built and published by **Netlify**. Any changes merged into the `main` branch will trigger a new deployment. You do not need to do anything special for deployment beyond getting your PR approved and merged.
