
let loginForm = document.getElementById("login-form");
let usernameInput = document.getElementById("username");
let passwordInput = document.getElementById("password");

function showModal(message) {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
        <div style="background: white; padding: 20px; border-radius: 5px; text-align: center;">
          <p>${message}</p>
          <button id="closeModalBtn">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const loginForm = document.getElementById('login-form');
    loginForm.style.pointerEvents = 'none';
  
    const closeBtn = document.getElementById('closeModalBtn');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      loginForm.style.pointerEvents = 'auto';
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    });
  }
const logIn = async (e) => {
    e.preventDefault()
    const username = usernameInput.value;
    const password = passwordInput.value;
    console.log("username", username)
    console.log("password;", password )

    const credentials = btoa(`${username}:${password}`);
    console.log("btoa:", credentials)

    try {
        const response = await fetch('https://01.kood.tech/api/auth/signin',{
            method: 'POST',
            headers: {
              Authorization: `Basic ${credentials}`,
             'Content-Type': 'application/json'
            }
        })
        if (!response.ok) {
            throw new Error('Invalid credentials or server error');
        }
        const token = await response.json();
        console.log("token:", token)
        if (!token) {
            throw new Error('Token is missing in the response');
        }

        localStorage.setItem('jwt', token);
        window.location.href = "./details.html"
    } catch (error){
        showModal("Invalid Credential")
    }
}
loginForm.addEventListener("submit", logIn)