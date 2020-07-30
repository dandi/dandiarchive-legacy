import pytest

from girder.exceptions import ValidationException
from girder.models.folder import Folder

from girder_dandi_archive.constants import SCHEMA_MINIMUM_VERSION

pytestmark = pytest.mark.plugin("dandi_archive")


def test_no_metadata_validates(server, drafts_collection):
    folder = Folder().createFolder(drafts_collection, "000001", parentType="collection")
    Folder().save(folder)


def test_empty_metadata_does_not_validate(server, drafts_collection):
    folder = Folder().createFolder(drafts_collection, "000001", parentType="collection")
    with pytest.raises(ValidationException) as exception:
        folder = Folder().setMetadata(folder, {"dandiset": {}})
    assert (
        str(exception.value)
        == "Missing required metadata field 'schemaVersion'. Check that your client is up to date."
    )


def test_current_version_validates(server, drafts_collection):
    folder = Folder().createFolder(drafts_collection, "000001", parentType="collection")
    folder = Folder().setMetadata(folder, {"dandiset": {"schemaVersion": SCHEMA_MINIMUM_VERSION}})


def test_older_schema_version_does_not_validate(server, drafts_collection):
    folder = Folder().createFolder(drafts_collection, "000001", parentType="collection")
    with pytest.raises(ValidationException) as exception:
        folder = Folder().setMetadata(folder, {"dandiset": {"schemaVersion": "0.0.0-rc0"}})
    assert (
        str(exception.value)
        == f"Schema version 0.0.0-rc0 is less than the minimum version {SCHEMA_MINIMUM_VERSION}. "
        "Check that your client is up to date."
    )


def test_newer_schema_version_validates(server, drafts_collection):
    folder = Folder().createFolder(drafts_collection, "000001", parentType="collection")
    folder = Folder().setMetadata(folder, {"dandiset": {"schemaVersion": "9.9.9-rc9"}})
