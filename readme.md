# Local Kanban Board

This project provides a simple, locally-hosted Kanban board that allows you to manage tasks within your browser. No data is transferred externally; all information is stored securely in your browser's IndexedDB.

Hosted Version -  [https://dejoe.github.io/kanban/](https://dejoe.github.io/kanban/)

## Features

*   **Local Storage:** Data is stored in your browser's IndexedDB, ensuring privacy and offline accessibility.
*   **Board Creation:**  Create boards for different projects or time periods (e.g., weekly planning).
*   **Four Task States:** Each board has four columns representing different task states or bins.  You can customize the meaning of these states to fit your workflow, but common examples include:
    *   **To Do:**  Tasks that are planned but not yet started.
    *   **In Progress:** Tasks that are currently being worked on.
    *   **Blocked:** Tasks that are currently unable to proceed due to some obstacle.
    *   **Completed:** Tasks that have been finished.
*   **Drag-and-Drop:** Easily move tasks between columns by dragging and dropping them.
*   **Task Management:** Add, edit, and delete tasks within each column. (Details on these actions will depend on the specific implementation in `script.js`).
*   **Simple Setup:**  The project can be run locally with any basic HTTP web server.  No complex backend or database setup is required.

## Usage

1.  **Download:** Obtain the project files (e.g., by downloading a ZIP archive or cloning from a repository).  You should have at least `index.html`, `script.js`, and likely `styles.css`.
2.  **Serve Locally:** Use a simple HTTP web server to serve the project files.  Several options are available, including:
    *   **Python's `http.server` (Python 3):**  Navigate to the project directory in your terminal and run `python3 -m http.server`.  The board will then be accessible at `http://localhost:8000` (or the port number displayed in the terminal).
    *   **Python's `SimpleHTTPServer` (Python 2):**  Navigate to the project directory in your terminal and run `python -m SimpleHTTPServer 8000`.  The board will then be accessible at `http://localhost:8000`.
    *   **Node.js's `http-server`:** If you have Node.js and npm installed, install `http-server` globally with `npm install -g http-server`.  Then navigate to the project directory in your terminal and run `http-server`.  The board will be accessible at the address shown in the terminal output (usually `http://127.0.0.1:8080`).
    *   **Other web servers:**  You can use any web server that can serve static files.
3.  **Open in Browser:** Open your web browser and navigate to the address where the server is running (e.g., `http://localhost:8000`). You should see the Kanban board interface.
4.  **Create and Manage:** Follow the on-screen instructions to create a new board, add tasks, and manage their progress through the different states.

## Under the Hood

The core functionality of the Kanban board is implemented in:

*   `index.html`:  Provides the basic structure of the page (HTML elements for the board, columns, tasks, etc.).
*   `script.js`: Contains the JavaScript code that handles:
    *   Interacting with the user interface (responding to clicks, drags, etc.).
    *   Managing the data in IndexedDB (reading, writing, updating, deleting tasks and boards).
    *   Dynamically updating the HTML to reflect changes in the data.
*   `styles.css`:  Controls the visual appearance of the board.

By storing data in IndexedDB, the board remains functional even when you close and reopen your browser (as long as you are using the same browser on the same device).

## Customization (If Applicable)

Depending on the specific implementation, you might be able to customize aspects of the board such as:

*   Column names
*   Visual styling (colors, fonts, etc.)

Refer to comments within the `script.js` and `styles.css` files for information on how to make such customizations.  (Note: These are just examples; the actual customization options will depend on the project's code).