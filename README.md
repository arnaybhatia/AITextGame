# 🤖 **Faustus - AI Chat Interface**

A sleek and responsive AI chat interface powered by **Mistral AI** 🚀. Engage in real-time conversations with AI while enjoying a modern and user-friendly experience.

![Faustus Preview](preview.gif)

---

## ✨ **Features**

- 🎯 **Real-Time AI Chat** powered by **Mistral AI**
- 💾 **Persistent Chat History** to never lose your conversations
- 🎨 **Modern UI** built with **Tailwind CSS**
- 📱 **Responsive Design** for seamless usage across devices
- 🔄 **Multiple Chat Sessions** with history management
- 🔒 **Secure API Key Handling**

---

## 🛠️ **Tech Stack**

### **Frontend**
- **HTML**
- **JavaScript**
- **Tailwind CSS**

### **Backend**
- **Python**
- **Flask**

### **AI Integration**
- **Mistral AI**

### **Deployment**
- **Vercel (Frontend)**
- **Vercel Serverless Functions (Backend)**

---

## 🚀 **Getting Started**

### **Prerequisites**

Ensure you have the following installed on your system:
- **Node.js** (v14+)
- **Python** (v3.8+)
- **Mistral AI API Key**

---

## 🛠️ **Installation**

### **Local Development**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/arnaybhatia/AITextGame.git
   cd faustus
   ```

2. **Install dependencies:**

   **Frontend:**
   ```bash
   npm install
   ```

   **Backend:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add your **Mistral AI API key**:
   ```env
   MISTRAL_API_KEY=your_api_key_here
   ```

4. **Run the application locally:**

   **Frontend:**
   ```bash
   npm run build:css
   ```

   **Backend:**
   ```bash
   python app.py
   ```

   Open your browser and navigate to `http://localhost:5000`.

---

### **Deployment on Vercel**

1. **Frontend Deployment:**

   - Push your repository to GitHub/GitLab.
   - Connect your repository to **Vercel**.
   - Configure your **build command** and **output directory** as follows:
     - Build Command: `npm run build:css`
     - Output Directory: `styles`

2. **Backend Deployment:**

   - Navigate to your **Vercel Dashboard**.
   - Deploy the backend using **Vercel Serverless Functions**:
     - Ensure the `app.py` is within the **api** folder (e.g., `/api/app.py`).
   - Configure your environment variables in the **Vercel Settings**.

3. Once deployed, your application will be available at your **Vercel domain**.

---

## 🧑‍💻 **Contributing**

Contributions are welcome! To get started:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Open a pull request.

---

## 📄 **License**

This project is licensed under the [MIT License](LICENSE).

---

## ❤️ **Acknowledgments**

Special thanks to:
- The **Mistral AI** team for their incredible API.
- The **Tailwind CSS** team for their responsive design framework.
- The open-source community for inspiration and resources.

