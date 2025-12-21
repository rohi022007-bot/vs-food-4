<script>
  (function(){
    const pwInput = document.getElementById('password');
    const toggle = document.getElementById('togglePw');
    const eye = document.getElementById('eyeIcon');

    // SVG paths for open/closed eye (swap inner HTML)
    const openEye = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle>';
    const closedEye = '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.6 18.6 0 0 1 4-5.11" opacity=".0"></path>';

    // Toggle behavior
    toggle.addEventListener('click', () => {
      const isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(isPassword));
      toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

      // update icon — using a simple visible change (we'll invert stroke for clarity)
      if (isPassword) {
        // show a "slashed" eye by adding a slash element
        eye.innerHTML = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>';
      } else {
        eye.innerHTML = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle>';
      }

      // move focus back to input for keyboard friendliness
      pwInput.focus();
      // place cursor at end (nice UX when showing password)
      try {
        const len = pwInput.value.length;
        pwInput.setSelectionRange(len, len);
      } catch (e) { /* ignore on unsupported browsers */ }
    });

    // allow Enter key on toggle to act like click (accessibility)
    toggle.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggle.click();
    });
  })();
</script>