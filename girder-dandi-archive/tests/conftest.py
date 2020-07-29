import pytest

from girder.models.collection import Collection
from girder.models.folder import Folder

from girder_dandi_archive.constants import SCHEMA_MINIMUM_VERSION
from girder_dandi_archive.util import get_or_create_drafts_collection


@pytest.fixture(autouse=True)
def drafts_collection(db):
    red_herring_collection = Collection().createCollection(
        "red_herring_collection", reuseExisting=True
    )
    # A folder that matches dandiset metadata, but not in drafts collection.
    red_herring_dandiset_000001_folder = Folder().createFolder(
        parent=red_herring_collection, parentType="collection", name="000001", public=True,
    )
    meta = {
        "dandiset": {
            "name": "red",
            "description": "herring",
            "identifier": "000001",
            "schemaVersion": SCHEMA_MINIMUM_VERSION,
        }
    }
    Folder().setMetadata(red_herring_dandiset_000001_folder, meta)

    return get_or_create_drafts_collection()
