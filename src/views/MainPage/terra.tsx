import env from "react-dotenv";
import {ConnectedWallet} from "@terra-money/wallet-provider";
import {TxResult} from "@terra-money/wallet-types/types";
import {LCDClient, MsgExecuteContract} from "@terra-money/terra.js";
// import { MONKEEZ_NFT, KONGZ_NFT, REWARD_NFT, STAKE_CONTRACT } from "../../config";
//you can use this to get the total amount of deposits

const MONKEEZ_NFT = env.MONKEEZ_NFT;
const KONGZ_NFT = env.KONGZ_NFT;
const REWARD_NFT = env.REWARD_NFT;
const STAKE_CONTRACT = env.STAKE_CONTRACT;

console.log(MONKEEZ_NFT);



export interface NFT{
    name: string,
    description: string,
    img_url: string
}
export interface TokenIdList{
    tokens: string[]
}
export interface ClusterReward{
    claimable_num: number,
    remain_time: number | null
}
export interface RewardResponse{
    claimable_amount: number,
    cluster_rewards: ClusterReward[]
}

export interface TokenInfo{
    token_kind: number,
    token_id: string,
    is_common: boolean
}
export interface StakedClusterInfo {
    tokens: TokenInfo[]

}
export interface MonkeezTokenInfo {
    name: string,
    description: string,
    image: string
}

export interface RewardTokenInfo{
    extension: RewardTokenExtension
}
export interface RewardTokenExtension{
    image: string,
    description: string,
    name: string
}

export interface KongzTokenExtension{
    image: string,
    description: string,
    name: string
}
export interface KongzTokenInfo {
    extension: KongzTokenExtension
}

export interface StakedTokenData{
    clusters: StakedClusterInfo[]
}

export async function getMonkeezNFTs(lcdClient: LCDClient, wallet: ConnectedWallet, start_after: string | null, limit: number | null): Promise<TokenIdList>{
    return await lcdClient.wasm.contractQuery(MONKEEZ_NFT, {
        tokens: {
            owner: wallet.walletAddress,
            start_after: start_after,
            limit: limit,
        },
    });
}

export async function getKongzNFTs(lcdClient: LCDClient, wallet: ConnectedWallet, start_after: string | null, limit: number | null): Promise<TokenIdList>{
    return await lcdClient.wasm.contractQuery(KONGZ_NFT, {
        tokens: {
            owner: wallet.walletAddress,
            start_after: start_after,
            limit: limit,
        },
    });
}

export async function getRewardNFTs(lcdClient: LCDClient, wallet: ConnectedWallet, start_after: string | null, limit: number | null): Promise<TokenIdList>{
    return await lcdClient.wasm.contractQuery(REWARD_NFT, {
        tokens: {
            owner: wallet.walletAddress,
            start_after: start_after,
            limit: limit,
        },
    });
}

export async function getStakedNFTs(lcdClient: LCDClient, wallet: ConnectedWallet): Promise<StakedTokenData>{
    return await lcdClient.wasm.contractQuery(STAKE_CONTRACT, {
        staked_tokens: {
            owner: wallet.walletAddress,
        },
    });
}

export async function getClaimInfo(lcdClient: LCDClient, wallet: ConnectedWallet): Promise<RewardResponse> {
    return await lcdClient.wasm.contractQuery(STAKE_CONTRACT, {
        reward: {
            staker: wallet.walletAddress
        }
    })
}




export async function getKongzNftInfo(lcdClient: LCDClient, id: string ): Promise<KongzTokenInfo> {
    return await lcdClient.wasm.contractQuery(KONGZ_NFT, {
        nft_info: {
            token_id: id,
        },
    });
}
export async function getMonkeezNftInfo(lcdClient: LCDClient, id: string ): Promise<MonkeezTokenInfo> {
    return await lcdClient.wasm.contractQuery(MONKEEZ_NFT, {
        nft_info: {
            token_id: id,
        },
    });
}

export async function getRewardNftInfo(lcdClient: LCDClient, id: string ): Promise<RewardTokenInfo> {
    return await lcdClient.wasm.contractQuery(REWARD_NFT, {
        nft_info: {
            token_id: id,
        },
    });
}

export async function claim(wallet: ConnectedWallet) : Promise<TxResult>{
    let msg = new MsgExecuteContract(wallet.walletAddress, STAKE_CONTRACT, {
        claim_reward:{}
    });
    return await wallet.post({
        msgs: [msg]
    });
}

export async function stake(wallet: ConnectedWallet, tokenId: string, tokenKind: number) : Promise<TxResult>{
    let nftAddr;
    if (tokenKind === 0) { //monkeez
        nftAddr = MONKEEZ_NFT;
    }else {
        nftAddr = KONGZ_NFT;
    }
    let msg = new MsgExecuteContract(wallet.walletAddress, nftAddr, {
        send_nft:{
            contract: STAKE_CONTRACT,
            token_id: tokenId,
            msg: "eyJzdGFrZSI6e319" //  base64_encode {"stake":{}}
        }
    });
    return await wallet.post({
        msgs: [msg]
    });
}

export async function unstake(wallet: ConnectedWallet, tokenId: string, tokenKind: number): Promise<TxResult>{
    let msg = new MsgExecuteContract(wallet.walletAddress, STAKE_CONTRACT, {
        unstake:{
            token_kind:tokenKind,
            token_id: tokenId
        }
    });
    return await wallet.post({
        msgs: [msg]
    });
}

export function getTimeToString(time: number){
    let day = Math.floor(time / 86400);
    let hour = Math.floor((time - day * 86400)/3600);
    let min = Math.floor((time - day*86400 - hour*3600)/60);
    return ('0'+day).slice(-2) + 'D '+('0'+hour).slice(-2) +'H '+ ('0'+min).slice(-2)+'M';
}