import json

import girder_client

ADMIN_USER = "admin"
ADMIN_PASS = "letmein"
GIRDER_INNER_HOST = "girder"
GIRDER_INNER_PORT = 8080

girder_url = "http://{host}:{port}/api/v1".format(
    host=GIRDER_INNER_HOST, port=GIRDER_INNER_PORT
)

gc = girder_client.GirderClient(apiUrl=girder_url)
gc.authenticate(ADMIN_USER, ADMIN_PASS)


# All sample collections by default are public to access
def ensure_collection(collection_name, public=True):
    for col in gc.listCollection():
        if col["name"] == collection_name:
            return col

    return gc.createCollection(collection_name, public=public)


for c in ("drafts", "releases"):
    ensure_collection(c)

# labs is primarily for practicing metadata search etc, to be gone later on
# and will not be in the deployed instance
labs_collection = ensure_collection("labs")


# caching to avoid additional HTTP round trips
girder_folders = {}
meta_filepath = "/data/cleaned_joined_nwb_meta.json"
with open(meta_filepath, "r") as meta_file:
    nwb_meta = json.load(meta_file)
    for nwb in nwb_meta:
        lab_folder_path = nwb["lab"]
        # create a folder structure based on path value in nwb file, which may be nested
        try:
            lab_folder = girder_folders[lab_folder_path]
        except KeyError:
            lab_folder = girder_folders[lab_folder_path] = gc.post(
                'dandi',
                {"name": lab_folder_path, "description": "A Dandiset"},
            )
        path_parts = nwb["path"].split("/")
        parent_folder = lab_folder
        folder_prefix = lab_folder_path
        # deal with any nesting in path
        for folder_name in path_parts[:-1]:
            folder_prefix = "/".join([folder_prefix, folder_name])
            parent_folder = girder_folders.get(
                folder_prefix,
                gc.createFolder(
                    parent_folder["_id"], folder_name, reuseExisting=True
                ),
            )
        # add the item and metadata
        item = gc.createItem(
            parent_folder["_id"],
            path_parts[-1],
            reuseExisting=True,
            metadata=nwb,
        )
