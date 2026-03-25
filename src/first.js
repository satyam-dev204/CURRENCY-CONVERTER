const mainUrl="https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";
const country=document.querySelectorAll(".country select");
const btn=document.querySelector("button");
const fromCUrr=document.querySelector(".from select");
const toCUrr=document.querySelector(".to select");
const output=document.querySelector(".output");


for(let select of country){
    for(code in countryList){
        let newOption=document.createElement("option");
        newOption.innerText=code;
        if(select.name==="from"&& code==="USD"){
            newOption.selected="selected";
        }
        if(select.name==="to"&& code==="INR"){
            newOption.selected="selected";
        }
        select.append(newOption);
    }


    select.addEventListener("change",(evt)=>{
        updateFlag(evt.target);
    })
}

const updateFlag=(element)=>{
    let currCode=element.value;
    let countryCode=countryList[currCode];
    let newSrc=`https://flagsapi.com/${countryCode}/flat/64.png`;
    let img=element.parentElement.querySelector("img");
    img.src=newSrc;
}

btn.addEventListener("click",async(evt)=>{
    evt.preventDefault();
    let amt=document.querySelector(".input input");
    let amtVal=amt.value;
    if(amtVal<=0){
        amt.value="1";
        amtVal=1;
    }
    const URL=`${mainUrl}/${fromCUrr.value.toLowerCase()}.json`;
    let response=await fetch(URL);
    let data=await response.json();
    let file=data[fromCUrr.value.toLowerCase()];
    let rate=file[toCUrr.value.toLowerCase()];
    console.log(rate);
    output.innerText=`${amtVal} ${fromCUrr.value}=${rate*amtVal} ${toCUrr.value}`;
    
})

