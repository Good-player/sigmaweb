function authenticateAndEditPost() {
    window.location.href = 'https://github.com/login/oauth/authorize?client_id=Ov23liBR9DzXII9XGVyn&scope=repo';
}

// After authentication, capture the code from the redirect URL and send it to your server
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (code) {
    fetch('/auth/github/callback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
    }).then(response => response.json())
      .then(data => {
          if (data.username === 'Good-player') {
              // Show delete/edit buttons
          }
      });
}
