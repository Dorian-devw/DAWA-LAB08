(function(){
  function decodeToken(token){
    try{
      const parts = token.split('.');
      return JSON.parse(atob(parts[1]));
    }catch(e){return null}
  }

  document.addEventListener('DOMContentLoaded', function(){
    try {
      const token = sessionStorage.getItem('token');
      const navProfile = document.getElementById('nav-profile');
      const navLogout = document.getElementById('nav-logout');
      const navSignin = document.getElementById('nav-signin');
      const navSignup = document.getElementById('nav-signup');
      function tokenValid(t) {
        if (!t) return false;
        const p = decodeToken(t);
        if (!p) return false;
        if (p.exp && (Date.now() / 1000) > p.exp) return false;
        return true;
      }
      if (tokenValid(token)) {
        if (navProfile) navProfile.style.display = '';
        if (navLogout) navLogout.style.display = '';
        if (navSignin) navSignin.style.display = 'none';
        if (navSignup) navSignup.style.display = 'none';
      } else {
        sessionStorage.removeItem('token');
        if (navProfile) navProfile.style.display = 'none';
        if (navLogout) navLogout.style.display = 'none';
        if (navSignin) navSignin.style.display = '';
        if (navSignup) navSignup.style.display = '';
      }
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.addEventListener('click', (e)=>{ e.preventDefault(); sessionStorage.removeItem('token'); location.href='/signIn'; });
    } catch(e) {
      console.warn('Error toggling nav links', e);
    }

    // Brand logo redirect according to token/role
    try{
      const brand = document.getElementById('brandLogo');
      if (brand) brand.addEventListener('click', (e)=>{
        e.preventDefault();
        const token = sessionStorage.getItem('token');
        const p = decodeToken(token) || {};
        if (token && p.exp && (Date.now()/1000) <= p.exp) {
          if ((p.roles||[]).includes('admin')) location.href = '/admin';
          else location.href = '/dashboard';
        } else {
          sessionStorage.removeItem('token');
          location.href = '/signIn';
        }
      });
    }catch(e){/* noop */}
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
      signInForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try{
          const res = await fetch('/api/auth/signIn',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
          if (!res.ok) return alert('Credenciales inválidas');
          const data = await res.json();
          sessionStorage.setItem('token', data.token);
          const p = decodeToken(data.token) || {};
          if ((p.roles||[]).includes('admin')) location.href='/admin';
          else location.href='/dashboard';
        }catch(err){alert('Error al iniciar sesión')}
      });
    }

    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
      signUpForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const payload = {
          name: document.getElementById('name').value,
          lastName: document.getElementById('lastName').value,
          phoneNumber: document.getElementById('phoneNumber').value,
          birthdate: document.getElementById('birthdate').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        };
        try{
          const res = await fetch('/api/auth/signUp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
          if (!res.ok) {
            const err = await res.json();
            return alert(err.message || 'Error al registrar');
          }
          alert('Registrado correctamente. Por favor inicia sesión.');
          location.href='/signIn';
        }catch(err){alert('Error al registrarse')}
      });
    }
  });
})();
