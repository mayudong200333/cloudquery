# Google Ads Source Plugin Configuration Reference

## Example

This example syncs from Google Ads to a Postgres destination.
The (top level) source spec section is described in the [Source Spec Reference](/docs/reference/source-spec).

:configuration

## Google Ads Spec

This is the (nested) spec used by the Google Ads source plugin:

- `developer_token` (`string`, required):

  A Google Ads [Developer Token](https://developers.google.com/google-ads/api/docs/get-started/dev-token).

- `login_customer_id` (`string`, optional. Default: `""`):

  Google Ads [Login customer ID](https://support.google.com/google-ads/answer/1704344).

  Format: digits either with or without hyphen (`-`).

  This parameter allows to specify the root account to fetch data from (as well as linked accounts).
  If omitted, the accessible accounts are
  [listed](https://developers.google.com/google-ads/api/docs/account-management/listing-accounts)
  and are used instead.

  **Note**: As [Google Ads API](https://developers.google.com/google-ads/api/)
  doesn't allow obtaining the current account ID, you can set this parameter to the account ID you generated
  [Developer Token](https://developers.google.com/google-ads/api/docs/get-started/dev-token) from.
  This way you'll be able to fetch the data from the root management account as well.

- `customers` (`[]string`, optional. Default: empty)

  Fetch the data only from the specified accounts.
  If account ID specified is a management account, the data will be fetched both from this account and all accounts accessible from it.

  Format: digits either with or without hyphen (`-`).

- `oauth` ([OAuth](#google-ads-oauth-spec) spec, optional. Default: empty)


### Google Ads OAuth spec

[Google Ads API](https://developers.google.com/google-ads/api/)
requires OAuth authorization for `https://www.googleapis.com/auth/adwords` scope to execute API calls.

- `access_token` (`string`, optional. Default: `""`)

  An access token that you generated authorizing for `https://www.googleapis.com/auth/adwords` scope
  (e.g., by using [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)).

- `client_id` (`string`, optional. Default: `""`)

  OAuth 2.0 Client ID.

- `client_secret` (`string`, optional. Default: `""`)

  OAuth 2.0 Client secret.
