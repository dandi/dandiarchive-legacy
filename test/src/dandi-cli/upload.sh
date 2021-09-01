#!/bin/sh

# this is a script that handles uploading test assets using dandi-cli

if [ $# -lt 3 ]
  then
    echo "Usage: upload.sh [test dataset folder name] [identifier of dandiset to upload to] [dandi API key]"
    exit
fi


folder="test_data/$1"
identifier=$2
apiKey=$3

new_folder="$(mktemp -d)/$identifier"

# Copy test data to new folder
cp -r $folder $new_folder

# Set correct dandiset identifier in dandiset.yaml
sed -i -e "s/{{DANDISET_IDENTIFIER}}/$identifier/g" "$new_folder/dandiset.yaml"

# Upload assets using dandi-cli
cd $new_folder && DANDI_DEVEL=1 DANDI_API_KEY="$apiKey" dandi upload -i dandi-api-local-docker-tests -e force --allow-any-path --validation ignore
