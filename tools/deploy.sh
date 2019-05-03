#!/usr/bin/env bash

# abort on errors
set -e

# navigate into the build output directory
cd docs/.vuepress/dist

git init

git config credential.helper 'cache --timeout=120'
git config user.email "circleci-deploy@circleci.com"
git config user.name "circleci"

git add -A
git add .
git commit -m "Update via CircleCI"
# if you are deploying to https://<USERNAME>.github.io
git push -q -f https://${GITHUB_PERSONAL_TOKEN}@github.com/orangemi/orangemi.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
