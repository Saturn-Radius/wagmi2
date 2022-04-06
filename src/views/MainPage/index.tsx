import React, { useState, useEffect } from "react";
import { ConnectType, useWallet, useConnectedWallet, WalletStatus, useLCDClient } from "@terra-money/wallet-provider";

import styled from "styled-components";
import {
  claim, ClusterReward, getClaimInfo,
  getKongzNftInfo,
  getKongzNFTs,
  getMonkeezNftInfo,
  getMonkeezNFTs,
  getRewardNftInfo,
  getRewardNFTs,
  getStakedNFTs, getTimeToString,
  stake,
  StakedClusterInfo,
  StakedTokenData,
  TokenIdList,
  unstake
} from "./terra";

interface NFTCluster{
  nfts: NFT[]
}

const Connect = () => {
  const [tabId, setTabId] = useState(1);

  const [myNFTs, setMyNFTs] = useState<NFT[]>([]);
  //const [stakedNFTs, setStakedNFTs] = useState<NFT[]>([]);
  const [stakedClusters, setStakedClusters] = useState<NFTCluster[]>([]);
  const [rewardedNFTs, setRewardedNFTs] = useState<NFT[]>([]);
  const [clusterClaimableInfo, setClusterClaimableInfo] = useState<ClusterReward[]>([]);
  const { status, connect, disconnect } = useWallet();
  const userWallet = useConnectedWallet();
  const lcdClient = useLCDClient();

  useEffect(() => {
    (async function () {
      if (!userWallet) return;
      //get Monkeez NFTs
      let monkeezTokenIdList: TokenIdList = await getMonkeezNFTs(lcdClient, userWallet, null, 25);
      let monkeezTokens = monkeezTokenIdList.tokens;

      let monkeezNftInfoList1: NFT[] = [];
      if (monkeezTokens) {
        const promArr = monkeezTokens.map(async (token_id) => await getMonkeezNftInfo(lcdClient, token_id));
        const monkeezNftInfoList = await Promise.all(promArr);
        monkeezNftInfoList1 = monkeezNftInfoList.map((tokenInfo) => {
          return {
            name: tokenInfo.name,
            description: tokenInfo.description,
            img_url: "https://d75aawrtvbfp1.cloudfront.net/" + tokenInfo.image,
            token_id: tokenInfo.name.substring(14),
            token_kind: 0,
          };
        });
      }
      // get Kongz NFTs
      let kongzTokenIdList: TokenIdList = await getKongzNFTs(lcdClient, userWallet, null, 25);
      let kongzTokens = kongzTokenIdList.tokens;
      let kongzNftInfoList1: NFT[] = [];
      if (kongzTokens) {
        const promArr1 = kongzTokens.map((token_id) => getKongzNftInfo(lcdClient, token_id));
        const kongzNftInfoList = await Promise.all(promArr1);
        kongzNftInfoList1 = kongzNftInfoList.map((tokenInfo) => {
          return {
            name: tokenInfo.extension.name,
            description: tokenInfo.extension.description,
            img_url: "https://gateway.ipfs.io/ipfs/" + tokenInfo.extension.image.substring(7),
            token_id: tokenInfo.extension.name.substring(1),
            token_kind: 1,
          };
        });
      }

      let nftInfoList = [...monkeezNftInfoList1, ...kongzNftInfoList1];
      setMyNFTs(nftInfoList);

      //get Staked
      let clusters: NFTCluster[] = [];
      let stakedTokenIdList: StakedTokenData = await getStakedNFTs(lcdClient, userWallet);

      for (const cluster of stakedTokenIdList.clusters){
        let token_list: NFT[] = [];
        for (const token of cluster.tokens) {
          if (token.token_kind === 0) {
            //monkeez
            let nftInfo = await getMonkeezNftInfo(lcdClient, token.token_id);
            token_list.push({
              name: nftInfo.name,
              description: nftInfo.description,
              img_url: "https://d75aawrtvbfp1.cloudfront.net/" + nftInfo.image,
              token_id: nftInfo.name.substring(14),
              token_kind: 0,
            });
          } else {
            // kongz
            let nftInfo = await getKongzNftInfo(lcdClient, token.token_id);
            token_list.push({
              name: nftInfo.extension.name,
              description: nftInfo.extension.description,
              img_url: "https://gateway.ipfs.io/ipfs/" + nftInfo.extension.image.substring(7),
              token_id: nftInfo.extension.name.substring(1),
              token_kind: 1,
            });
          }
        }
        console.log('---1:');
        console.log(token_list);
        clusters.push({nfts: token_list});
      }
      console.log(clusters);
      setStakedClusters(clusters);


      //get reward NFTs
      let rewardTokenIdList: TokenIdList = await getRewardNFTs(lcdClient, userWallet, null, 25);
      let rewardTokens = rewardTokenIdList.tokens;

      const promArr3 = rewardTokens.map((token_id) => getRewardNftInfo(lcdClient, token_id));
      const rewardNftInfoList = await Promise.all(promArr3);
      const rewardNftInfoList1: NFT[] = rewardNftInfoList.map((tokenInfo) => {
        return {
          name: tokenInfo.extension.name,
          description: tokenInfo.extension.description,
          img_url: "https://gateway.ipfs.io/ipfs/" + tokenInfo.extension.image.substring(7),
          token_id: tokenInfo.extension.name.substring(1),
          token_kind: 2,
        };
      });
      setRewardedNFTs(rewardNftInfoList1);
    })();
  }, [lcdClient, userWallet]);

  useEffect(()=>{
    setInterval(()=>{
      (async function(){
        if (!userWallet){
          return;
        }
        let cluster_infos:ClusterReward[] = [];
        let claimInfo = await getClaimInfo(lcdClient, userWallet!);
        for (const cluster of claimInfo.cluster_rewards){
          let cluster_info = {
            claimable_num: cluster.claimable_num,
            remain_time: cluster.remain_time,
          }
          cluster_infos.push(cluster_info);
        }
        setClusterClaimableInfo(cluster_infos);
      })();
    }, 3000);
  },[lcdClient, userWallet, stakedClusters])
  const ConnectShow = async () => {
    if (status === WalletStatus.WALLET_CONNECTED) {
      await disconnect();
      return;
    }
    connect();
    // connect(ConnectType.EXTENSION);
    // connect(ConnectType.WALLETCONNECT);
  };

  const formatAddressShort = (address: string): string => {
    if (!address) return ``;

    return address.slice(0, 8) + "…" + address.slice(address.length - 4, address.length);
  };
  const claimReward = async () => {
    let result = await claim(userWallet!);
    if (result.success) {
      console.log("reward success");
      setTimeout(async () => {
        let rewardTokenIdList: TokenIdList = await getRewardNFTs(lcdClient, userWallet!, null, 25);
        console.log("get reward Token List");
        console.log(rewardTokenIdList);
        console.log(rewardTokenIdList.tokens);

        let newRewardTokens = rewardTokenIdList.tokens;

        let token_id_list = rewardedNFTs.map((item) => item.token_id);
        let new_token_ids = newRewardTokens.filter((x) => !token_id_list.includes(x));
        console.log(new_token_ids);

        const promArr3 = new_token_ids.map(async (token_id) => await getRewardNftInfo(lcdClient, token_id));
        const rewardNftInfoList = await Promise.all(promArr3);
        const rewardNftInfoList1: NFT[] = rewardNftInfoList.map((tokenInfo) => {
          return {
            name: tokenInfo.extension.name,
            description: tokenInfo.extension.description,
            img_url: "https://gateway.ipfs.io/ipfs/" + tokenInfo.extension.image.substring(7),
            token_id: tokenInfo.extension.name.substring(1),
            token_kind: 2,
          };
        });
        setRewardedNFTs([...rewardedNFTs, ...rewardNftInfoList1]);
      }, 5000);
    }
  };
  const stakeToken = async (myNFT: NFT) => {
    let result = await stake(userWallet!, myNFT.token_id, myNFT.token_kind);
    if (result.success) {
      console.log("stake success");
      setMyNFTs(myNFTs.filter((item) => item !== myNFT));
      let data = [...stakedClusters];

      let is_inserted = false;
      for (const cluster of data ){
        if ( cluster.nfts && cluster.nfts.length < 5) {
          cluster.nfts.push(myNFT);
          is_inserted = true;
          break;
        }
      }
      if (!is_inserted){
        let new_cluster: NFTCluster = {
          nfts: []
        };
        new_cluster.nfts.push(myNFT);
        data.push(
          new_cluster
        )
      }

      setStakedClusters(data);
    }
  };

  const unstakeToken = async (selNFT: NFT) => {
    // tokenId: string, tokenKind: number
    let result = await unstake(userWallet!, selNFT.token_id, selNFT.token_kind);
    if (result.success) {

      setMyNFTs([...myNFTs, selNFT]);

      let data = [...stakedClusters];

      let filtered_data = data.map((cluster)=>{
        return {nfts: cluster.nfts.filter((item) => item !== selNFT) };
      });

      setStakedClusters(filtered_data);
    }
  };
  const onClick1 = (num: number) => {
    setTabId(num);
    const myElement1 = document.getElementById("mytokens")!;
    const myElement2 = document.getElementById("staked")!;
    const myElement3 = document.getElementById("rewarded")!;

    if (num === 1) {
      myElement1.style.backgroundColor = "rgba(0,179,237)";
      myElement2.style.backgroundColor = "black";
      myElement3.style.backgroundColor = "black";
    }
    if (num === 2) {
      myElement2.style.backgroundColor = "rgba(0,179,237)";
      myElement1.style.backgroundColor = "black";
      myElement3.style.backgroundColor = "black";
    }
    if (num === 3) {
      myElement3.style.backgroundColor = "rgba(0,179,237)";
      myElement2.style.backgroundColor = "black";
      myElement1.style.backgroundColor = "black";
    }
  };

  return (
    <MainPage>
      <SectionCon>
        <LogoImage src={require("../../assets/image/logo2.png").default} ml={"10vw"} alt="" />
        <ConButton ml="auto" name="connect" className={status === WalletStatus.WALLET_CONNECTED ? "connect" : ""} onClick={() => ConnectShow()}>
          <Title size="23px" color="white">
            {status === WalletStatus.WALLET_CONNECTED ? formatAddressShort(userWallet?.walletAddress!) : "Connect"}
          </Title>
        </ConButton>
        <ConButton name="claim" onClick={() => claimReward()}>
          <Title size="23px" color="white">
            Claim reward NFT
          </Title>
        </ConButton>
      </SectionCon>
      <TabSection>
        <ButtonTabDiv>
          <TabButton1 id="mytokens" onClick={() => onClick1(1)}>
            <span>My</span>
            <span>Tokens</span>
          </TabButton1>

          <TabButton id="staked" onClick={() => onClick1(2)}>
            <span>Staked</span>
            <span>NFT</span>
          </TabButton>

          <TabButton id="rewarded" onClick={() => onClick1(3)}>
            <span>Rewarded</span>
            <span>NFT</span>
          </TabButton>
        </ButtonTabDiv>
        <TabBodyDiv>
          {tabId === 1 ? (
            <TabBodySubDiv>
              {myNFTs.map((myNFT: NFT, index) => {
                return (
                  <div key={index}>
                    <SectionImgMark src={myNFT.img_url} alt="" />
                    <ThreeButtons>
                      <TopAddressMenu2>{myNFT["name"]} </TopAddressMenu2>
                      <TopAddressMenu2>{myNFT["description"]}</TopAddressMenu2>
                      <MarketBtn id="stake" onClick={() => stakeToken(myNFT)}>
                        Stake
                      </MarketBtn>
                    </ThreeButtons>
                  </div>
                );
              })}
            </TabBodySubDiv>
          ) : tabId === 2 ? (
            <ClusterViewLayout>
              {stakedClusters.map((cluster, index) => {

                let reward_claim = clusterClaimableInfo[index];
                if (!reward_claim){
                  return;
                }
                let remain_time:number = reward_claim.remain_time!;
                if (reward_claim.remain_time == null ){
                  remain_time = 0;
                }
                return (
                    cluster.nfts && cluster.nfts.length >0 && <ClusterView key={index} clusterInfo={cluster} clusterIndex={index+1} remainTime={getTimeToString(remain_time)} claimableNum = {reward_claim.claimable_num} unstakeToken = {unstakeToken} />
                );
              })}
            </ClusterViewLayout>
          ) : (
            <>
            <TabBodySubDiv>
              {rewardedNFTs.map((nft: NFT, index) => {
                return (
                  <div key={index}>
                    <SectionImgMark src={nft.img_url} alt="" />
                    <ThreeButtons>
                      <TopAddressMenu2>{nft["name"]} </TopAddressMenu2>
                      <TopAddressMenu2>{nft["description"]}</TopAddressMenu2>
                    </ThreeButtons>
                  </div>
                );
              })}
            </TabBodySubDiv>
            </>
          )}
        </TabBodyDiv>
      </TabSection>
    </MainPage>
  );
};

interface ClusterInfoProps{
  clusterInfo: NFTCluster
  unstakeToken: (selNFT: NFT) => Promise<void>
  clusterIndex: number,
  remainTime: string,
  claimableNum: number,
}

export const ClusterView:React.FC<ClusterInfoProps> = ({clusterInfo, unstakeToken, remainTime,claimableNum,  clusterIndex})=>{
  return (
        <ClusterLayout>
          <ClusterTimer>Cluster {clusterIndex} - Remain Time: {remainTime},  Claimable Amount: {claimableNum} </ClusterTimer>
          <ClusterBody>
        {
          clusterInfo.nfts && clusterInfo.nfts.map((token, index)=> {
            return (<ClusterItem key={index}>
              <SectionImgMark src={token.img_url} alt="" />
              <ThreeButtons>
                <TopAddressMenu2>{token["name"]} </TopAddressMenu2>
                <TopAddressMenu2>{token["description"]}</TopAddressMenu2>
                <MarketBtn id="withdraw" onClick={() => unstakeToken(token)}>
                  Unstake
                </MarketBtn>
              </ThreeButtons>
            </ClusterItem>)
          })
        }
          </ClusterBody>
        </ClusterLayout>


  )
};

const MainPage = styled.div`
  position: sticky;
  /* background-image: linear-gradient(128deg, rgb(0, 108, 143) 0%, rgb(7, 7, 7) 100%);
  background: url(${require("../../assets/image/background.png").default});
  background-size: cover;
  background-attachment: fixed; */
  width: 100%;
  height: 100vh;
  padding: 40px;
  padding-top: 0px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: right;
  @media (max-width: 1100px) {
    padding: 30px;
  }
  @media (max-width: 800px) {
    padding: 20px;
  }
  @media (max-width: 500px) {
    padding: 10px;
  }
`;
const SectionCon = styled.div<{ hVal?: string }>`
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-box-align: right;
  -webkit-box-pack: right;
  padding: 20px 0px;
  grid-gap: 20px;
  @media (max-width: 1100px) {
    grid-gap: 15px;
  }
  @media (max-width: 800px) {
    grid-gap: 10px;
    padding: 15px 0px;
    flex-direction: column;
  }
  @media (max-width: 500px) {
    grid-gap: 5px;
    flex-direction: column;
  }
`;
const LogoImage = styled.img<{ ml?: string }>`
  height: 100px;
  margin-left: ${(p) => (p.ml ? p.ml : "20px")};
  margin-right: auto;
  @media (max-width: 1100px) {
  }
  @media (max-width: 800px) {
    margin-left: unset;
    margin-right: unset;
  }
  @media (max-width: 500px) {
    margin-left: unset;
    margin-right: unset;
  }
`;
const TabSection = styled.div<{ hVal?: string }>`
  flex: 1;
  background-color: transparent;
  --tw-bg-opacity: 0.5;
  padding: 0rem;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;
const ButtonTabDiv = styled.div<{ hVal?: string }>`
  border-radius: 0.75rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  grid-gap: 10px;
  @media (max-width: 1100px) {
  }
  @media (max-width: 800px) {
    grid-gap: 5px;
  }
  @media (max-width: 500px) {
    grid-gap: 0px;
  }
  --tw-ring-inset: var(--tw-empty);
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(8, 121, 158, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
`;
const TabBodyDiv = styled.div<{ hVal?: string }>`
  flex: 1;
  flex-direction: column;
  position: relative;
  background: url(${require("../../assets/image/tab-back1.png").default});
  background-size: 100% 100%;
  padding: 35px;
  border: 2px solid rgba(0, 179, 237, var(--tw-border-opacity));
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  color: rgba(255, 255, 255, var(--tw-text-opacity));
  font-family: "Roboto Condensed";
  overflow-y: auto;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  --tw-bg-opacity: 1;
  --tw-bg-opacity: 1;
  --tw-bg-opacity: 0.5;
  --tw-bg-opacity: 1;
  --tw-text-opacity: 1;
  --tw-border-opacity: 1;
  display: flex;
  flex-wrap: wrap;
  grid-gap: 30px;
`;

const TabBodySubDiv = styled.div`
  flex: 1;
  position: relative;
  color: rgba(255, 255, 255, var(--tw-text-opacity));
  overflow-y: auto;
  display: grid;
  flex-wrap: wrap;
  grid-gap: 30px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  & > div {
    flex: 1;
    display: flex;
    align-items: center;
    flex-direction: column;
    grid-gap: 0.75rem;
    @media (max-width: 1100px) {
      min-width: 25%;
      max-width: 50%;
    }
    @media (max-width: 800px) {
      min-width: 35%;
      max-width: unset;
    }
    @media (max-width: 500px) {
      min-width: 50%;
      max-width: unset;
    }
  }
`;
//------------My tokens tab--------------
const ThreeBtnCont = styled.div<{ hVal?: string; imgUrl?: string }>`
  border: 1px solid gold;
  width: 100%;
  display: flex;
  & > div {
    flex: 1;
    padding: 10px 0px;
    font-size: 30px;
    text-align: center;
    @media (max-width: 1100px) {
      padding: 8px 0px;
      font-size: 24px;
    }
    @media (max-width: 800px) {
      padding: 6px 0px;
      font-size: 18px;
    }
    @media (max-width: 500px) {
      padding: 4px 0px;
      font-size: 14px;
    }
    &:first-child {
      border-right: 1px solid gold;
    }
    &:last-child {
      border-left: 1px solid gold;
    }
  }
`;
const SectionImgMark = styled.img<{ hVal?: string; imgUrl?: string }>`
  width: 90%;
`;
//--------------Button-------------------
const ConButton = styled.button<{ hVal?: string; ml?: string }>`
  position: relative;
  padding: 0.75rem 1.25rem;
  padding-right: 1.25rem;
  padding-bottom: 0.75rem;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: row;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: center;
  column-gap: 1.25rem;
  border-width: 2px;
  border-top-width: 2px;
  border-right-width: 2px;
  border-bottom-width: 2px;
  border-left-width: 2px;
  --tw-border-opacity: 1;
  border-color: rgba(0, 179, 237, var(--tw-border-opacity));
  border-radius: 0.375rem;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;

  background-color: transparent;
  background-color: rgba(6, 56, 127, 1);
  font-family: sans-serif;
  font-size: 18px;
  color: white;
  line-height: inherit;
  margin: 0px;
  margin-top: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  max-width: 250px;
  max-height: 50px;
  cursor: pointer;
  @media (max-width: 1100px) {
  }
  @media (max-width: 800px) {
    width: 100%;
  }
  @media (max-width: 500px) {
    width: 100%;
  }
  &:hover {
    border-color: transparent;
    background-color: rgba(0, 179, 237, 1);
    &.connect:after {
      content: "Disconnect";
      position: absolute;
      background: #2fa0da;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 23px;
    }
  }
`;
const TabButton1 = styled.button<{ hVal?: string }>`
  border-color: rgb(0, 179, 237);
  display: flex;
  flex: 1 1 0%;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
  background-color: rgba(0, 179, 237, 1);
  padding: 0.75rem 1rem;
  margin-bottom: -2px;
  font-family: sans-serif;
  font-size: 25px;
  color: white;
  @media (max-width: 1100px) {
    font-size: 22px;
  }
  @media (max-width: 800px) {
    font-size: 20px;
    flex-direction: column;
  }
  @media (max-width: 500px) {
    font-size: 18px;
    flex-direction: column;
  }
  &:hover {
    border-color: transparent;
    background-color: rgba(0, 179, 237, 1);
  }
`;
const TabButton = styled.button<{ hVal?: string }>`
  border-color: rgb(0, 179, 237);
  display: flex;
  flex: 1 1 0%;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
  background-color: black;
  padding: 0.75rem 1rem;
  margin-bottom: -2px;
  font-family: sans-serif;
  font-size: 25px;
  color: white;
  @media (max-width: 1100px) {
    font-size: 22px;
  }
  @media (max-width: 800px) {
    font-size: 20px;
    flex-direction: column;
  }
  @media (max-width: 500px) {
    font-size: 18px;
    flex-direction: column;
  }
  &:hover {
    border-color: transparent;
    background-color: rgba(0, 179, 237, 1);
  }
`;
// --------------Middle Three Buttons Menu-------------------
const ThreeButtons = styled.div<{ hVal?: string }>`
  position: relative;
  width: 190px;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  grid-gap: 10px;
  box-sizing: border-box;
  -webkit-box-align: center;
  -webkit-box-pack: center;
`;
const TopAddressMenu2 = styled.div`
  background-color: rgba(0, 0, 0, var(--tw-bg-opacity));
  width: 100%;
  min-height: 1.5em;
  border: 2px solid rgba(0, 179, 237, var(--tw-border-opacity));
  border-radius: 0.1875rem;
  text-transform: none;
  font-size: 20px;
  font-weight: 300;
  text-transform: none;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-box-align: center;
  --tw-bg-opacity: 1;
  --tw-border-opacity: 1;
`;

const MarketBtn = styled.button`
  margin-top: 10px;
  background-color: rgba(0, 179, 237, var(--tw-bg-opacity));
  width: 100%;
  min-height: 1.5em;
  border-style: none;
  border-radius: 0.1875rem;
  font-size: 20px;
  line-height: 1.125rem;
  color: rgba(255, 255, 255, var(--tw-text-opacity));
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-box-pack: center;
  -webkit-box-align: center;
  --tw-bg-opacity: 1;
  --tw-text-opacity: 1;
`;
//-------
const NFTButtons = styled.div<{ hVal?: string }>`
  position: relative;
  opacity: 1;
  left: 5%;
  padding-top: 1.25rem;
  border-top-width: 1px;
  margin-top: 110px;
  width: 190px;
  height: 160px;
  -webkit-box-align: center;
  align-items: center;
  flex-flow: column wrap;
  -webkit-box-pack: center;
  justify-content: center;
  align-items: center;
  opacity: 1;

  box-sizing: border-box;
  border-width: 0px;
  border-style: solid;
  border-color: rgb(112, 112, 112);
`;
//---------------Connect for wallet---------------------

const ReSectionCon = styled.div<{ hVal?: string }>`
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  min-height: calc(100vh - 400px);
  height: 100%;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  background-color: transparent;
  flex-flow: column wrap;
  /* row-count: 3;
  col-count: 0; */
`;

const SectionTitle1 = styled.p<{ hVal?: string }>`
  // display: flex;
  position: absolute;
  top: 25%;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
`;

const Section1 = styled.div<{ hVal?: string }>`
  --tw-bg-opacity: 0.05;
  background-color: rgba(0, 16, 22, var(--tw-bg-opacity));
  background-image: linear-gradient(transparent 0%, rgb(0, 16, 22) 80%);
  min-width: 350px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  min-height: 550px;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  border-radius: 0.375rem;
`;
const CloseButton = styled.div<{ hVal?: string }>`
  position: absolute;
  top: 20%;
  left: 56%;
  padding: 0.75rem 1.25rem;
  padding-top: 0.2rem;
  padding-right: 0.5rem;
  padding-bottom: 0.2rem;
  padding-left: 0.5rem;
  display: flex;
  flex-direction: row;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  column-gap: 1.25rem;
  border-width: 2px;
  border-top-width: 2px;
  border-right-width: 2px;
  border-bottom-width: 2px;
  border-left-width: 2px;
  --tw-border-opacity: 1;
  border-color: rgba(0, 179, 237, var(--tw-border-opacity));
  border-radius: 0.375rem;
  border-style: solid;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;

  background-color: transparent;
  font-family: sans-serif;
  font-size: 18px;
  color: white;
  line-height: inherit;
  margin: 0px;
  margin-top: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  margin-left: 0px;

  &:hover {
    border-color: transparent;
    background-color: rgba(0, 179, 237, 1);
  }
`;
const ReConButton = styled.button<{ hVal?: string }>`
  padding: 0.75rem 1.25rem;
  padding-top: 0.75rem;
  padding-right: 1.25rem;
  padding-bottom: 0.75rem;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: row;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  column-gap: 1.25rem;
  border-width: 2px;
  border-top-width: 2px;
  border-right-width: 2px;
  border-bottom-width: 2px;
  border-left-width: 2px;
  --tw-border-opacity: 1;
  border-color: rgba(0, 179, 237, var(--tw-border-opacity));
  border-radius: 0.375rem;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;

  background-color: transparent;
  font-family: sans-serif;
  font-size: 18px;
  color: white;
  line-height: inherit;
  margin: 0px;
  margin-top: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  margin-left: 0px;

  &:hover {
    border-color: transparent;
    background-color: rgba(0, 179, 237, 1);
  }
`;

const Section = styled.div<{ hVal?: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  row-gap: 0.75rem;
  --tw-ring-inset: var(--tw-empty);
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(8, 121, 158, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  margin-top: 170px;
  width: 288px;
  height: 268px;

  background-color: transparent;
`;

const ClusterViewLayout = styled.div`
  width:100%;
  row-gap: 1.25rem;
  display:flex;
  flex-direction:column;
`

const ClusterLayout = styled.div`
  border: solid 1px rgb(0, 179, 237);
  
`;
const ClusterTimer = styled.div`
  font-size: 40px;
  padding-left:20px
  
`;
const ClusterBody = styled.div`
  display:grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
`
const ClusterItem = styled.div`
  display:flex;
  flex-direction: column;
  padding:10px;
  align-items: center;
  justify-content: center;
`
//-----------------------------------------------------
const Title = styled.span<{ color?: string; size?: string }>`
  margin-top: 0px;
  margin-bottom: 0px;
  font-size: ${({ size }) => (size ? size : "25px")};
  color: ${({ color }) => (color ? color : "white")};
  font-family: sans-serif;
`;
interface NFT {
  name: string;
  description: string;
  img_url: string;
  token_id: string;
  token_kind: number;
}

export default Connect;
