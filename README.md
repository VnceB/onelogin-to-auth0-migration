# Migrating from OneLogin to Auth0

By design, passwords can not be migrated out of an IDaaS like OneLogin since they go through a one-way hash operation before being stored. Auth0 offers a feature called [Automatic Migration](https://auth0.com/docs/users/concepts/overview-user-migration) that supports the progressive migration of users with their passwords as they log into the system.
 
The sample code in this repo is inspired by other [User Migration Scenarios](https://auth0.com/docs/users/references/user-migration-scenarios) for migrating from IDaaS solutions like Okta, Gigya and Stormpath. It also builds on the [Auth0 tenant migration](https://github.com/ArtiomCiumac/Auth0-tenant-migration) recipe.

## Prerequisites

## OneLogin

Since the custom DB connection will use OneLogin APIs, we need to create new API credentials for Auth0 in OneLogin. Auth0 will require permission to authenticate and search users, there is no need to have write permissions in the custom DB connection unless you plan to modify it to set a migration flag in the OneLogin users (the current implementation does not do that).

1. In the OneLogin dashboard, go to _Developer/API credentials_ menu and click the _New Credential_ button.
1. Choose the _Read Users_ permissions.
1. Copy the client id and client secrets for later use.


## Auth0

This repo contains samples files to create the connection and a test client if required. There are two ways to configure this in Auth0: manually or using automated deployment tools like the Deploy CLI or github extension.

### Manual configuration

1. Follow the [instructions](https://auth0.com/docs/connections/database/migrating#enable-automatic-migration) to create a new custom database, making sure you enable _Import users to Auth0_
1. In the new database settings, go to _Custom database_ section and fill the
   following key/value pairs _Settings_:
   * `ol_region` - set to 'us' or 'eu' based on the region configured in OneLogin.
   * `ol_subdomain` - set to the name of your OneLogin tenant.
   * `ol_api_client_id` - set to the Auth0 API Credential Client ID created in OneLogin.
   * `ol_api_client_secret` - set to the Auth0 API Credential Client Secret created in OneLogin.
1. Copy code found in this repo _auth0/onelogin-migration_ directory for the _Login_ and _Get User_ Database Action Scripts (see _Custom Database_ in your newly created Database configuration)
1. Enable Applications in the Connection so you can test

### Automated deployment

1. Clone this repository and rename the database name subfolder 
   `auth0/database-connections/onelogin-migration` to your liking
1. In the Auth0 tenant, install and configure your [source control extension](https://auth0.com/docs/extensions#extend-integrate) of choice
1. If using the Auth0 Deploy CLI, make sure to configure string replacements for the OneLogin parameters in the _AUTH0_KEYWORD_REPLACE_MAPPINGS_ section of your config.json file or if using a source code extension, in the Mappings tabs of the extension configuration:
```
{
    "ONELOGIN_REGION": "<'us' or 'eu' based on the region configured in OneLogin>",
    "ONELOGIN_SUBDOMAIN": "<name of your OneLogin tenant>",
    "ONELOGIN_API_CLIENT_ID": "<Auth0 API Credential Client ID created in OneLogin>",
    "ONELOGIN_API_CLIENT_SECRET": "<Auth0 API Credential Client Secret created in OneLogin>"
}
```
1. Follow instructions to deploy configurations for your extension of choice


## Usage

You can use the Try button in each of the Database Action Scripts to confirm proper configuration or
 you can use an Application enabled in the connection to login with existing OneLogin credentials.


## Further development

- Notify OneLogin that the user was migrated, either by setting a custom flag or by disabling the user
- Propagate OneLogin access and id_token to Auth0 for APIs that have not migrated to trust Auth0 tokens (this would only work on first login or wuth Import Mode disabled)
- Add progressive profiling rule to request an email address for users that have a username only