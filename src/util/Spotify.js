let accessToken; // = "BQAHdWDvZf1Xw5HbBdKMlTmUB8Yw4lchzbiFgEjl7_NPa4gcdqHYWPMTvLWUm2u_zQp_SxdZOIuM5D28c5dpjKT_xy-n6G_fSixWBpfOLWfjggacT3B6Mk6bFnYkqGctYjSXeiEYgZqfKtYp7Yeulmom2YMfY-Ry-2fwR12EVuEAu_tP2w";
let tokenExpiration;
const redirectURI = "http://localhost:3000/";
const appClientID = "620a2a87b56a4ba7a5a4f04373730ac9";

export const Spotify = {
  getAccessToken() {
    // debugger;
    if (accessToken) {
      return accessToken;
    } else {
      console.log("No access token");
      const checkAccessToken = window.location.href.match(
        /access_token=([^&]*)/
      );
      const checkExpiration = window.location.href.match(/expires_in=([^&]*)/);
      if (checkAccessToken && checkExpiration) {
        accessToken = checkAccessToken[1];
        tokenExpiration = checkExpiration[1];
        window.setTimeout(() => (accessToken = ""), tokenExpiration * 1000);
        window.history.pushState("Access Token", null, "/");
        return accessToken;
      } else {
        console.log("Token or Expiration check failed!");
        window.location = `https://accounts.spotify.com/authorize?client_id=${appClientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
      }
    }
  },

  search(searchTerm) {
    // debugger;
    return fetch(
      `https://api.spotify.com/v1/search?type=track&q=${searchTerm}`,
      {
        headers: {
          Authorization: "Bearer " + this.getAccessToken() //accessToken
        }
      }
    )
      .then(response => response.json())
      .then(jsonResponse => {
        if (!jsonResponse) {
          return [];
          console.log("No results");
        } else {
          return jsonResponse.tracks.items.map(result => {
            console.log(`Working on ${result.name}`);
            return {
              id: result.id,
              name: result.name,
              artist: result.artists[0].name,
              album: result.album.name,
              uri: result.uri
            };
          });
        }
      });
  },

  savePlaylist(playlistName, trackURIs) {
    debugger;
    if (!playlistName || !trackURIs) {
      return;
    }

    const defaultAccessToken = this.getAccessToken();
    const headers = { Authorization: "Bearer " + defaultAccessToken };
    let userID = "";

    return fetch("https://api.spotify.com/v1/me", { Headers: headers })
      .then(response => response.json())
      .then(jsonResponse => {
        userID = jsonResponse.id;

        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ name: playlistName })
        })
          .then(response => response.json())
          .then(jsonResponse => {
            const playlistID = jsonResponse.id;

            return fetch(
              `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
              {
                method: "POST",
                headers: {
                  Authorization: "Bearer " + defaultAccessToken,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ uris: trackURIs })
              }
            );
          });
      });
  }
};
//   let playlistID = fetch(
//     `https://api.spotify.com/v1/users/${userID}/playlists`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: "Bearer " + defaultAccessToken,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ name: playlistName })
//       }
//     }
//   )
// //     .then(response => response.json)
// //     .then(response => response.id);

// //   fetch(`https://api.spotify.com//v1/users/${userID}/playlists/${playlistID}/tracks`, {
// //     method: "POST",
// //     headers: {
// //       Authorization: "Bearer " + this.getAccessToken(),
// //       "Content-Type": "application/json"
// //     },
// //     body: JSON.stringify({ uris: trackURIs })
// //   });

// // }

//Spotify.getAccessToken();
