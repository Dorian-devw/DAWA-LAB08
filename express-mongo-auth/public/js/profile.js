// Perfil y dashboards: obtiene datos usando token en sessionStorage
(function(){
  function getToken(){ return sessionStorage.getItem('token'); }
  function decode(token){ try{ return JSON.parse(atob(token.split('.')[1])); }catch(e){return null} }

  async function fetchMe(){
    const token = getToken();
    if (!token) return location.href='/signIn';
    try{
      const res = await fetch('/api/users/me',{ headers: { 'Authorization': 'Bearer '+token }});
      if (res.status === 401) { sessionStorage.removeItem('token'); return location.href='/signIn'; }
      if (!res.ok) return alert('Error al obtener perfil');
      return await res.json();
    }catch(e){ sessionStorage.removeItem('token'); location.href='/signIn'; }
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    const path = location.pathname;
    if (path === '/profile'){
      const me = await fetchMe();
      const cont = document.getElementById('profileContent');
      if (!me) return;
      cont.innerHTML = `
        <form id="profileForm">
          <div class="row">
            <div class="input-field col s12">
              <input id="email" type="email" value="${me.email}" disabled>
              <label for="email" class="active">Email</label>
            </div>
            <div class="input-field col s6">
              <input id="name" type="text" value="${me.name || ''}" required>
              <label for="name" class="active">Nombre</label>
            </div>
            <div class="input-field col s6">
              <input id="lastName" type="text" value="${me.lastName || ''}" required>
              <label for="lastName" class="active">Apellido</label>
            </div>
            <div class="input-field col s6">
              <input id="phoneNumber" type="text" value="${me.phoneNumber || ''}" required>
              <label for="phoneNumber" class="active">Teléfono</label>
            </div>
            <div class="input-field col s6">
              <input id="birthdate" type="date" value="${me.birthdate ? new Date(me.birthdate).toISOString().slice(0,10) : ''}" required>
              <label for="birthdate" class="active">Fecha de nacimiento</label>
            </div>
            <div class="input-field col s12">
              <input id="url_profile" type="text" value="${me.url_profile || ''}">
              <label for="url_profile" class="active">URL Perfil</label>
            </div>
            <div class="input-field col s12">
              <input id="address" type="text" value="${me.address || ''}">
              <label for="address" class="active">Dirección</label>
            </div>
            <div class="col s12">
              <button class="btn waves-effect waves-light" type="submit">Guardar</button>
            </div>
          </div>
        </form>
      `;

      const form = document.getElementById('profileForm');
      form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const payload = {
          name: document.getElementById('name').value,
          lastName: document.getElementById('lastName').value,
          phoneNumber: document.getElementById('phoneNumber').value,
          birthdate: document.getElementById('birthdate').value,
          url_profile: document.getElementById('url_profile').value,
          address: document.getElementById('address').value
        };
        const token = getToken();
        try{
          const res = await fetch('/api/users/me', {method:'PUT', headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer '+token }, body: JSON.stringify(payload)});
          if (!res.ok) {
            const err = await res.json();
            return alert(err.message || 'Error al actualizar');
          }
          alert('Perfil actualizado');
          location.reload();
        }catch(err){ alert('Error al actualizar perfil'); }
      });
    }

    if (path === '/dashboard'){
      const me = await fetchMe();
      const el = document.getElementById('userData');
      if (!me) return;
      el.innerHTML = `<pre>${JSON.stringify(me, null, 2)}</pre>`;
    }

    if (path === '/admin'){
      const token = getToken();
      if (!token) return location.href='/signIn';
      const p = decode(token) || {};
      if (!p.roles || !p.roles.includes('admin')) return location.href='/403';
      try{
        const res = await fetch('/api/users',{ headers: { 'Authorization': 'Bearer '+token }});
        if (!res.ok) return alert('Error al obtener usuarios');
        const users = await res.json();
        const tbody = document.getElementById('usersTable');
        tbody.innerHTML = users.map(u => `
          <tr>
            <td>${u.email}</td>
            <td>${u.name} ${u.lastName || ''}</td>
            <td>${(u.roles||[]).join(', ')}</td>
            <td>${new Date(u.createdAt).toLocaleString()}</td>
            <td><a href="/admin/user/${u.id}">Ver</a></td>
          </tr>
        `).join('');
      }catch(e){ console.error(e); alert('Error') }
    }
    if (path.startsWith('/admin/user/')){
      const id = path.split('/').pop();
      const token = getToken();
      if (!token) return location.href='/signIn';
      try{
        const [resUser, resRoles] = await Promise.all([
          fetch('/api/users/' + id, { headers: { 'Authorization': 'Bearer '+token }}),
          fetch('/api/roles', { headers: { 'Authorization': 'Bearer '+token }})
        ]);
        if (resUser.status === 401 || resRoles.status === 401) { sessionStorage.removeItem('token'); return location.href='/signIn'; }
        if (resUser.status === 403 || resRoles.status === 403) return location.href='/403';
        if (!resUser.ok) return alert('Error al obtener usuario');
        if (!resRoles.ok) return alert('Error al obtener roles');
        const u = await resUser.json();
        const rolesList = await resRoles.json();
        const el = document.getElementById('adminUserContent');
        // Render editable form including roles checkboxes
        el.innerHTML = `
          <form id="adminEditForm">
            <div class="row">
              <div class="input-field col s12">
                <input id="email" type="email" value="${u.email}" disabled>
                <label for="email" class="active">Email</label>
              </div>
              <div class="input-field col s6">
                <input id="name" type="text" value="${u.name || ''}" required>
                <label for="name" class="active">Nombre</label>
              </div>
              <div class="input-field col s6">
                <input id="lastName" type="text" value="${u.lastName || ''}" required>
                <label for="lastName" class="active">Apellido</label>
              </div>
              <div class="input-field col s6">
                <input id="phoneNumber" type="text" value="${u.phoneNumber || ''}" required>
                <label for="phoneNumber" class="active">Teléfono</label>
              </div>
              <div class="input-field col s6">
                <input id="birthdate" type="date" value="${u.birthdate ? new Date(u.birthdate).toISOString().slice(0,10) : ''}" required>
                <label for="birthdate" class="active">Fecha de nacimiento</label>
              </div>
              <div class="input-field col s12">
                <input id="url_profile" type="text" value="${u.url_profile || ''}">
                <label for="url_profile" class="active">URL Perfil</label>
              </div>
              <div class="input-field col s12">
                <input id="address" type="text" value="${u.address || ''}">
                <label for="address" class="active">Dirección</label>
              </div>
              <div class="col s12">
                <p><strong>Roles</strong></p>
                <div id="rolesCheckboxes">
                  ${rolesList.map(r => `
                    <p>
                      <label>
                        <input name="role" type="radio" class="role-radio" value="${r}" ${ (u.roles||[]).includes(r) ? 'checked' : '' } />
                        <span>${r}</span>
                      </label>
                    </p>
                  `).join('')}
                </div>
              </div>
              <div class="col s12">
                <button class="btn waves-effect waves-light" type="submit">Guardar cambios</button>
              </div>
            </div>
          </form>
        `;

        const form = document.getElementById('adminEditForm');
        form.addEventListener('submit', async (e)=>{
          e.preventDefault();
          const selectedEl = document.querySelector('.role-radio:checked');
          if (!selectedEl) return alert('Debe asignar exactamente un rol al usuario');
          const selectedRole = selectedEl.value;
          const payload = {
            name: document.getElementById('name').value,
            lastName: document.getElementById('lastName').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            birthdate: document.getElementById('birthdate').value,
            url_profile: document.getElementById('url_profile').value,
            address: document.getElementById('address').value,
            roles: [selectedRole]
          };
          try{
            const res = await fetch('/api/users/' + id, { method: 'PUT', headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer '+token }, body: JSON.stringify(payload) });
            if (!res.ok) {
              const err = await res.json();
              return alert(err.message || 'Error al actualizar usuario');
            }
            alert('Usuario actualizado');
            location.reload();
          }catch(e){ console.error(e); alert('Error') }
        });

      }catch(e){ console.error(e); alert('Error') }
    }
  });
})();
