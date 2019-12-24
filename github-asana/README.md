
# Github-Asana action

This action integrates asana with the github.

### Prerequisites

- Asana account with the permission on the particular project you want to integrate with.
- Must provide the ticket url in the PR description.

## Inputs

### `asana-pat`

**Required** Your public access token of asana, you can find it in [asana docs](https://developers.asana.com/docs/#authentication-basics).

### `trigger-phrase`

**Required** Prefix before the ticket i.e ASANA TICKET: https://app.asana.com/1/2/3/.

### `comment-pr-link`

**Optional** If true it can comment the pull request created url to the relative asana ticket.

### `target-section`

**Optional** Add/Move the ticket to the provided section i.e `merged`, `review`.


## Example usage

```yaml
uses: https://github.com/insurify/github-actions@master
with:
  asana-pat: 'Your PAT'
  target-section: 'In Review'
  comment-pr-link: true
```