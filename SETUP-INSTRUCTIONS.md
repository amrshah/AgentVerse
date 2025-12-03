# AgentVerse: Setup Instructions

Follow these steps to get the AgentVerse application running on your local machine for development and testing.

## Prerequisites

- **Node.js**: Version 20.x or higher.
- **npm** or a compatible package manager.
- **Git** for cloning the repository.
- **A Google AI API Key**: You'll need an API key for the Gemini models. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

## 1. Clone the Repository

If you haven't already, clone the project to your local machine:

```bash
git clone https://github.com/AlamiaSoft/AgentVerse.git
cd AgentVerse
```

## 2. Install Dependencies

Install all the necessary npm packages using the following command:

```bash
npm install
```

This will download and install all the project dependencies listed in `package.json`.

## 3. Set Up Environment Variables

The application uses a `.env` file to manage secret keys, like your Google AI API key.

1.  Create a new file named `.env` in the root of the project directory.
2.  Add the following line to the file, replacing `<YOUR_API_KEY>` with your actual Google AI API key:

```
GEMINI_API_KEY=<YOUR_API_KEY>
```

The application is configured to load this variable automatically.

## 4. Run the Development Servers

This project requires two separate development servers to be running simultaneously:

- The **Next.js frontend server** for the user interface.
- The **Genkit AI server** which handles the AI flows and model interactions.

Open two separate terminal windows or tabs in your project's root directory.

- **In Terminal 1 (Next.js App)**: Run the web application.

  ```bash
  npm run dev
  ```

  This will start the Next.js development server, typically on `http://localhost:9002`.

- **In Terminal 2 (Genkit Server)**: Run the Genkit AI server.

  ```bash
  npm run genkit:dev
  ```

  This will start the Genkit development server, which the Next.js app communicates with for all AI-related tasks.

## 5. Access the Application

Once both servers are running without errors, you can open your web browser and navigate to:

[http://localhost:9002](http://localhost:9002)

You should now see the AgentVerse application running and be able to interact with all its features.
