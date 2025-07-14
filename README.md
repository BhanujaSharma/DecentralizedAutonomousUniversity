#  Decentralized Autonomous University (DAU)

A Web3-powered educational platform built on the Internet Computer Protocol (ICP) that enables decentralized, transparent, and tamper-proof course management and certification. This dApp empowers students, instructors, and administrators through role-based access, decentralized credentials, and blockchain-backed transparency.

---
##  About the Project

The **Decentralized Autonomous University (DAU)** is a next-generation educational platform that reimagines learning, credentialing, and course management on the **Internet Computer Protocol (ICP)**.

It addresses several key problems with traditional education systems:

-  Centralized control over academic data and credentials  
-  Lack of transparency in course operations and access  
-  Certificates prone to forgery and loss  
-  Minimal accountability in student and instructor roles

  ---

##  Live Preview

> **Local:** `http://localhost:5173` (via Vite)  
> **Internet Identity:** Integrated (requires `dfx` and compatible browser)

---

##  Key Features

-  **Role-Based Access Control**
-  **Course Enrollment & Management**
-  **Verifiable Certificate Issuance**
-  **Blockchain Storage (Canisters)**
-  **Internet Identity Authentication**
-  **Frontend in React + Vite**
-  **Motoko-based Backend on ICP**

---

##  Project Structure

```bash
Decentralized-Autonomous-University/
├── src/
│   ├── components/           # Navbar, Panels, Cards, etc.
│   ├── pages/                # Home, Courses, Profile, Certificate
│   ├── styles/               # SCSS-based styling
│   └── App.jsx               # Core routing and structure
├── backend/
│   └── dao_university/       # Motoko smart contracts
├── public/                   # Static assets
├── dfx.json                  # DFX configuration
├── vite.config.js            # Vite bundler setup
└── README.md
````

---

##  Tech Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Frontend       | React.js, Vite, SCSS             |
| Backend        | Motoko, ICP Canisters            |
| Authentication | Internet Identity                |
| Blockchain     | Internet Computer Protocol (ICP) |
| Tooling        | DFX SDK                          |

---

##  Getting Started Locally

### 1. Prerequisites

* Node.js & npm
* [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/sdk-installation)
* Internet Identity (for authentication)

### 2. Clone the Repository

```bash
git clone https://github.com/BhanujaSharma/Decentralized-Autonomous-University.git
cd Decentralized-Autonomous-University
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Local ICP Replica

```bash
dfx start --background
```

### 5. Deploy the Canisters

```bash
dfx deploy
```

### 6. Run the Frontend

```bash
npm run dev
npm start
```

Then visit: `http://localhost:5173`

---

##  Internet Identity

The project supports Internet Identity for secure, passwordless authentication. To test:

* Deploy using `dfx deploy`
* Visit `http://localhost:5173`
* Use Internet Identity to sign in (usually opens in a new tab or modal)

---


##  Acknowledgements

* [DFINITY / Internet Computer Protocol](https://internetcomputer.org)
* [React & Vite](https://vitejs.dev/)
* Open Web community for inspiration and support

```
---

###  Real-World Use Cases

- **Universities & MOOC platforms** for issuing secure, verifiable certificates.
- **Corporate training** programs for employee upskilling.
- **Decentralized learning DAOs** for community-driven course governance.
- **Resume/LinkedIn integrations** with live verification of blockchain credentials.

###  Future Enhancements

- NFT-based achievements and skill badges  
- DAO voting for course content or instructor selection  
- Analytics dashboards for performance and engagement  
- Deployment to ICP mainnet with professional UI polish  
- Multi-language & accessibility support  


---
