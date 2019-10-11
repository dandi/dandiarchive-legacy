import os
import requests

from girder import events, plugin
from girder.exceptions import AccessException
from girder.utility import search
from girder_oauth.providers import github

_GH_ORG = os.environ.get('DANDI_GITHUB_ORG', 'dandi')


def _checkOrgMembership(event):
    token = event.info['token']['access_token']
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/json'
    }
    # Must get username in order to do the check membership request
    resp = requests.get(f'https://api.github.com/user', headers=headers)
    resp.raise_for_status()
    username = resp.json()['login']

    resp = requests.get(f'https://api.github.com/orgs/{_GH_ORG}/members/{username}', headers=headers)
    if resp.status_code != 204:
        raise AccessException(f'This user is not a member of the {_GH_ORG} GitHub org.')


class GirderPlugin(plugin.GirderPlugin):
    DISPLAY_NAME = 'DANDI Archive'

    def load(self, info):
        plugin.getPlugin('oauth').load(info)
        search.addSearchMode('dandi', search.getSearchModeHandler('text'))
        events.bind('oauth.auth_callback.before', 'dandi_archive', _checkOrgMembership)
        github.GitHub.addScopes(['read:org'])
