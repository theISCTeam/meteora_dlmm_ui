```
 ______   ______    ______                       __         ______   _______    ______        
|      \ /      \  /      \                     |  \       /      \ |       \  /      \       
 \$$$$$$|  $$$$$$\|  $$$$$$\                    | $$      |  $$$$$$\| $$$$$$$\|  $$$$$$\      
  | $$  | $$___\$$| $$   \$$       ______       | $$      | $$__| $$| $$__/ $$| $$___\$$      
  | $$   \$$    \ | $$            |      \      | $$      | $$    $$| $$    $$ \$$    \       
  | $$   _\$$$$$$\| $$   __        \$$$$$$      | $$      | $$$$$$$$| $$$$$$$\ _\$$$$$$\      
 _| $$_ |  \__| $$| $$__/  \                    | $$_____ | $$  | $$| $$__/ $$|  \__| $$      
|   $$ \ \$$    $$ \$$    $$                    | $$     \| $$  | $$| $$    $$ \$$    $$      
 \$$$$$$  \$$$$$$   \$$$$$$                      \$$$$$$$$ \$$   \$$ \$$$$$$$   \$$$$$$     
                                                                                                                              
```
### Note from the ISC team: This is a minimal UI+SDK built in JS/REACT for simplicity and meant to be developed further by the Meteora community, feel free to fork this repo and add your own features! Further development or maintenance by ISC is not guaranteed. This software is distributed under the MIT license. 

# Getting Started 
Make sure you have Node JS or Docker Compose installed on your machine.
Clone this repo, cd into it, and run the command:

```
npm install/
npm run start
```

OR
```
docker compose up --build
```


## Usage
### The UI comes pre-loaded with a default API key and RPC URL but these are shared resources and may be deprecated so it would be wise to create your own ones.

It's easy to get a Birdeye API key and the free tier is sufficient for this application. For your private RPC, Alchemy's free tier RPC is fine as well.

Replace the keys in /src/constants.js or input them into the header of the UI.

### Now all you have to do is input any wallet or position address.
The SDK will fetch, parse and compile the transactions for the account then output a breakdown of all your positions and a wallet summary.

#### NOTE: The more signatures a wallet has, the longer it will take

### Feature Ideas:
<ul>
    <li> 
        Model Realtime Expected (yearly or next 24h) APR based on liquidity fees from the previous 24hrs and liquidity shares in bins (For Open Positions)
    </li>
    <li>
        Visualize existing liquidity in each bin for a pool to help users choose a range.
    </li>
    <li>
        Wallet comparison/leaderboard
    </li>
</ul>

### Known Issues:
<ul>
    <li> USD and APR values for very short term positions are inaccurate for some positions</li>
    <li> Prices are in 24h timeframes due to API limitations, feel free to implement a Full Feature API if you provide short term liquidity or need better price accuracy</li>
    <li>
    Setting up a cache for already gathered transactions would help improve load times but this is probably safer to leave for the user to implement.
    </li>
    <li>
        Lack of support for Meteora V1 positions
    </li>
</ul>
