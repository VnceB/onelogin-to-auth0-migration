function getByEmail(email, callback) {
    // dependencies

    const rp = require('request-promise@1.0.2');

    const olBaseUrl = 'https://api.' + configuration.ol_region + '.onelogin.com';

    function getClientCredentialsRequestOptions() {
        return {
            method: 'POST',
            url: olBaseUrl + '/auth/oauth2/token',
            headers: {
                Authorization: 'client_id:' + configuration.ol_api_client_id + ', client_secret:' + configuration.ol_api_client_secret,
                'Content-type': 'application/json'
            },
            body:
            {
                grant_type: 'client_credentials'
            },
            json: true
        };
    }

    function getUserSearchOptions(token, searchValue) {
        return {
            uri: olBaseUrl + '/api/1/users',
            headers: {
                Authorization: 'Bearer ' + token
            },
            qs: {
                email: searchValue
            }
        };
    }

    function getApiAccessToken(res) {
        return res.data[0].access_token;
    }

    function getUserProfile(res) {
        const user = JSON.parse(res).data[0];
        if (user) {
            var profile = {
                //prefixing user_id with the onelogin tenant name to prevent eventual collisions
                user_id: configuration.ol_subdomain + '-' + user.id,

                email: user.email,
                username: user.username,
                name: user.firstname + ' ' + user.lastname,
                given_name: user.firstname,
                family_name: user.lastname,

                // We set the users email_verified to true as we assume if they were a valid
                // user in Onelogin, they have already verified their email
                // If this field is not set, the user will get an email asking them to verify
                // their account
                email_verified: true
            }
            return (profile);
        }
        else throw new Error("No user found");
    }

    rp(getClientCredentialsRequestOptions())
        .then(res => getApiAccessToken(res))
        .then(token => rp(getUserSearchOptions(token, email)))
        .then(res => getUserProfile(res))
        .then(profile => callback(null, profile))
        .catch(err => callback(new Error(err)));

}