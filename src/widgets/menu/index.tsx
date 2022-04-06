import React, { useState } from 'react'
import styled from 'styled-components'

const MenuBar = styled.div`
min-height: calc(100vh - 0px);
position: relative;
justify-content:left;
display: flex;
width:250px;


background-image: linear-gradient( 128deg , rgb(0, 108, 143) 0%, rgb(7, 7, 7) 100%);
opacity: 1;

`
const SectionCon = styled.div<{ hVal?: string }>`
     display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    min-height: calc(100vh - 0px);
    height: 100%;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    background-color: transparent;
    flex-flow: column wrap;
    row-count:2;
    col-count:0;
`
const SectionImg = styled.div<{ hVal?: string }>`
// display: flex;
position: absolute;
opacity: 0.75;
top: 5%;
width:221px;
height:184px;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: center;
justify-content: center;
background-image: url('/benqi/mark1.svg');
`
const SectionImgMark = styled.div<{ hVal?: string }>`
// display: flex;
position: absolute;
top: 75%;
width:187px;
height:89px;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: center;
justify-content: center;
background-image: url('/benqi/BENQI.svg');
`

const SectionTitle = styled.div<{ hVal?: string }>`
// display: flex;
position: absolute;
top: 28%;
width:290px;
height:80px;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: center;
justify-content: center;
background-image: url('/benqi/mark2.svg');
`
const SectionTitle1 = styled.p<{ hVal?: string }>`
// display: flex;
position: absolute;
top: 38%;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: center;
justify-content: center;
`

const Section1 = styled.div<{ hVal?: string }>`
--tw-bg-opacity: 0.05;
background-color: rgba(0,16,22,var(--tw-bg-opacity));
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


`
const ConButton = styled.button<{ hVal?: string }>`
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
border-color: rgba(0,179,237,var(--tw-border-opacity));
border-radius: 0.375rem;
border-top-left-radius: 0.375rem;
border-top-right-radius: 0.375rem;
border-bottom-right-radius: 0.375rem;
border-bottom-left-radius: 0.375rem;

background-color: transparent;
font-family: sans-serif;
font-size: 18px;
color:white;
line-height: inherit;
margin: 0px;
margin-top: 0px;
margin-right: 0px;
margin-bottom: 0px;
margin-left: 0px;

&:hover
{
  border-color:transparent;
  background-color: rgba(0,179,237,1);
}
`

const Section = styled.div<{ hVal?: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  row-gap: 0.75rem;
  --tw-ring-inset: var(--tw-empty, );
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(8,121,158,0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  margin-top:170px;
  width:288px;
  height:268px;

  background-color: transparent;
`
const Title = styled.span<{ color?: string, size?: string }>`
  margin-top: 0px;
  margin-bottom: 10px;
  font-size: ${({ size }) => size};
  color:${({ color }) => color};
  font-family:sans-serif;
`;


const Menu = () => {
  return (
    <MenuBar>
      <SectionCon>
        <SectionImg/>
     
     </SectionCon>
    </MenuBar>
  )
}

export default Menu
