from semantic_version import Version

from girder.exceptions import ValidationException

from .constants import SCHEMA_MINIMUM_VERSION


def validate_schema(event):
    meta = event.info["meta"]
    if "dandiset" not in meta:
        # Do not validate if there is no dandiset metadata property
        # Only top level dandiset folders should be validated
        return
    dandiset = meta["dandiset"]
    if "schemaVersion" not in dandiset:
        raise ValidationException(
            "Missing required metadata field 'schemaVersion'. "
            "Check that your client is up to date."
        )
    schema_version = dandiset["schemaVersion"]
    if Version(schema_version) < Version(SCHEMA_MINIMUM_VERSION):
        raise ValidationException(
            f"Schema version {schema_version} "
            f"is less than the minimum version {SCHEMA_MINIMUM_VERSION}. "
            "Check that your client is up to date."
        )
