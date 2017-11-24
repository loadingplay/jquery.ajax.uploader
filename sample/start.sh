#!/bin/bash

pushd "$(dirname)"
source venv/bin/activate
exec python server.py
popd
