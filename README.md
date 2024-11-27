# SecondBrain Backend 📚🧠

The backend for the SecondBrain application, allowing users to save, manage, and share their important links and content. This server handles user authentication, content storage, sharing functionality, and more.

---

## Features ✨

- **User Registration and Login**: Secure authentication with password hashing and JWT tokens.
- **Content Management**: Add, view, and delete YouTube and Twitter links, along with tags and titles.
- **Content Sharing**: Generate and manage shareable links to share content with others.
- **Secure API**: Middleware for protected routes ensuring only authorized users can access sensitive data.
- **RESTful API**: Clean and well-structured endpoints for seamless integration with the frontend.

---

## Technologies Used 🛠️

- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for building REST APIs.
- **MongoDB**: Database for storing user and content data.
- **Mongoose**: ORM for MongoDB.
- **Zod**: Input validation for request data.
- **bcrypt.js**: Secure password hashing.
- **jsonwebtoken (JWT)**: Token-based authentication.
- **dotenv**: Environment variable management.
- **uuid**: Unique identifier generation for share links.

---

## Installation and Setup ⚙️

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Rajput-vinay/secondBrainBackend.git
   cd second-brain-backend


2. **Install Dependencies**:
   ```bash
    npm install  

3. **Set Up Environment Variables: Create a .env file in the root directory and add the following**:
   ```bash
    PORT=5000
    MONGO_URI=your_mongo_database_url
    JWT_SECRET=your_jwt_secret

 4. **Start the Server**:
     ```bash
     npm run dev

## License 📜
This project is licensed under the [MIT License](LICENSE).

## Contact 📬
For feedback or inquiries, feel free to reach out:

- **Email**: [vinayrajput2004vr@gmail.com](mailto:vinayrajput2004vr@gmail.com)
- **LinkedIn**: [Vinay Rajput](https://www.linkedin.com/in/vinay-rajput-984668227/)
