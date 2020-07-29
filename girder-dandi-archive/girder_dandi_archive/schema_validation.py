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
        raise ValidationException("No schema version specified on folder")
    schema_version = dandiset["schemaVersion"]
    # TODO this will break if MINIMUM_VERSION ever has 2-digit numbers
    if schema_version < SCHEMA_MINIMUM_VERSION:
        raise ValidationException(
            f"Schema version {schema_version} "
            f"is less than the minimum version {SCHEMA_MINIMUM_VERSION}"
        )
