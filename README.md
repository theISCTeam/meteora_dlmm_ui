# Getting Started 
Make sure you have Node JS or Docker Compose installed on your machine
Clone this repo and run the command

npm install --force/
npm run start

OR

docker compose up --build


## Usage
### The UI comes pre-loaded with a default API key and RPC url but these are shared resources so it would be wise to create your own ones.

It's easy to get a Birdeye API key and the free tier is sufficient for this service. For your private RPC, Alchemy's free tier RPC is fine as well,
Replace the keys in /src/constants.js or input them into the header of the UI.

### Now all you have to do is input any wallet or position address.
The SDK will fetch, parse and compile the transactions for the account then output a breakdown of all your positions and a wallet summary.

#### NOTE: This might take a couple minutes for addresses with many signatures
