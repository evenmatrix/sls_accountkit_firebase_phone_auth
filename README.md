# User Login Service using facebook accountkit for login and firebase backend.
Implements Firebase custom token login using facebook accountkit tokens.


1. **Build Common**
  ```bash
  cd common
  yarn install 
  yarn build
  ```

2. **Build Service**. 
  ```bash
  cd users
  yarn install 
  serverless decrypt --stage dev --password 'what ever the password is'
  yarn build:webpack
  ```

4. **Deploy a Service:**

  Use this when you have made changes to your Functions, Events or Resources in `serverless.yml` or you simply want to deploy all changes within your Service at the same time.
  ```bash
  serverless deploy -v
  ```

