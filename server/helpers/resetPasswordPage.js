const getPage = (username, token) => `
<html>
  <head>
    <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet">
    <style>
    body{
      font-family: 'Montserrat', sans-serif;
      background-color: #F5F7F7;
    }
    .password-wrap {
      height: 552px;
      width: 904px;
      border: 1px solid rgba(17, 18, 21, 0.1);
      border-radius: 2px;
      background-color: #FFFFFF;
      margin: 72px auto;
    }
    .password-wrap .head {
      text-align: center;
      padding: 50px 0 80px 0;
    }
    .password-wrap .head h1 {
      margin: 0;
      color: #111215;
      font-size: 34px;
      font-weight: bold;
      letter-spacing: -0.5px;
      line-height: 38px;
      text-align: center;
    }
    .password-wrap .head h4 {
      margin: 0;
      color: #111215;
      font-size: 20px;
      font-weight: 600;
      line-height: 27px;
      text-align: center;
      font-weight: normal;
    }
    .password-wrap .form-wrap {
      padding: 0 72px;
    }
    .password-wrap .foot {
      padding: 24px 48px 0 48px;
      margin-top: 64px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
    }
    .password-wrap .foot button {
      height: 48px;
      padding: 0 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.2px;
      line-height: 16px;
      background: none;
      border: none;
    }
    .password-wrap .foot button.disabled {
      opacity: .65;
      pointer-events: none;
    }
    .password-wrap .foot button.btn-secondary {
      text-transform: uppercase;
      color: #111215;
    }
    .password-wrap .foot button.btn-primary {
      background-color: #111215;
      color: #fff;
      cursor: pointer;
    }

    .form-row {
      display: block;
      margin-bottom: 24px;
    }

    .label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      line-height: 18px;
      text-transform: uppercase;
    }

    .form .label {
      margin-bottom: 12px;
    }

    .input {
      height: 48px;
      width: 100%;
      border: 1px solid rgba(17, 18, 21, 0.2);
      border-radius: 2px;
      background-color: #fff;
      margin-bottom: 8px;
      padding: 0 12px;
      opacity: .8;
      color: #111215;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: .1px;
      line-height: 20px;
    }
    </style>
  </head>
  <body>
    <form id="reset-pass-form" class="password-wrap">
      <header class="head">
        <h1>Reset Password</h1>
        <h4>Choose a new password for ${username}</h4>
      </header>
      <div class="form-wrap form">
        <div class="form-row">
          <header class="label">New Password</header>
          <input id="password-field" class="input" type="password" />
        </div>
        <div class="form-row">
          <header class="label">Confirm Password</header>
          <input id="confirm-password-field" class="input" type="password" />
        </div>
      </div>
      <footer class="foot">
        <button type="submit" class="btn txt-btn btn-primary">Reset Password</button>
      </footer>
    </form>

    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    
    <script>
      window.addEventListener('load', () => {
        document.getElementById('reset-pass-form').addEventListener('submit', e =>  {
          e.preventDefault();
          const password = document.getElementById('password-field').value;
          const confirmPassword = document.getElementById('confirm-password-field').value;

          if (password !== confirmPassword) {
            alert('not matching passwords!!');
            return;
          }

          axios.defaults.headers.common['Authorization'] = 'bearer ${token}';
          axios.post('changePassword', { password });
        });
      });
    </script>
  </body>
</html>
`

module.exports = { getPage };