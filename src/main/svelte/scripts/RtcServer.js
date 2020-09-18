export default function RtcServer(){
    
  // CLIENT STARTRS HERE

  this.postClientAnswer = async function (description){
    await fetch("/stream/client/answer",{
      method: "POST",
      headers:{
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(description)
    });
  }

  this.getClientAnswer = async function(){
    let request = await fetch("/stream/client/answer",{
      headers:{
        "Accept":"text/plain"
      }
    });
    let text = await request.text();
    try{
      let metadata = JSON.parse(text);
      let d = new RTCSessionDescription(metadata);
      return d;
    }catch(e){
      return null;
    }
  }
  
  
  this.postClientCandidate = async function (iceCandidate){
    let candidate = JSON.stringify(iceCandidate);
    //console.log("setting client candidate:",candidate);
    await fetch("/stream/client/candidate",{
      method: "POST",
      headers:{
        "Content-Type": "text/plain"
      },
      body: candidate
    });
  }

  this.getClientCandidate = async function(){
    let request = await fetch("/stream/client/candidate",{
      headers:{
        "Accept":"text/plain"
      }
    });
    let text = await request.text();
    try{
      let metadata = JSON.parse(text);
      let d = new RTCIceCandidate(metadata);
      //console.log("reading client candidate:",text);
      return d;
    }catch(e){
      return null;
    }
  }





  // SERVER STARTRS HERE
  
  this.postServerOffer = async function(description){
    await fetch("/stream/server/offer",{
      method: "POST",
      headers:{
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(description)
    });
  }

  this.getServerOffer = async function (){
    let request = await fetch("/stream/server/offer",{
      headers:{
        "Accept":"text/plain"
      }
    });
    let text = await request.text();
    try{
      let metadata = JSON.parse(text);
      let d = new RTCSessionDescription(metadata);
      return d;
    }catch(e){
      return null;
    }
  }

  this.postServerCandidate = async function(iceCandidate){
    let candidate = JSON.stringify(iceCandidate);
    //console.log("setting server candidate:",candidate);
    await fetch("/stream/server/candidate",{
      method: "POST",
      headers:{
        "Content-Type": "text/plain"
      },
      body: candidate
    });
  }

  this.getServerCandidate = async function (){
    let request = await fetch("/stream/server/candidate",{
      headers:{
        "Accept":"text/plain"
      }
    });
    let text = await request.text();
    try{
      let metadata = JSON.parse(text);
      let d = new RTCIceCandidate(metadata);
      //console.log("reading server candidate:",text);
      return d;
    }catch(e){
      return null;
    }
  }

  
  

  this.waitForServerCandidate = () => {
    return new Promise(resolve => {
      let $this = this;
      (async function poll(){
        let request = await $this.getServerCandidate();
        if(request === null){
          setTimeout(poll,1000)
        } else resolve(request);
      })();
    });
  }

  this.waitForServerOffer = () => {
    return new Promise(resolve => {
      let $this = this;
      (async function poll(){
        let request = await $this.getServerOffer();
        if(request === null){
          setTimeout(poll,1000)
        } else resolve(request);
      })();
    });
  }

  this.waitForClientCandidate = () => {
    return new Promise(resolve => {
      let $this = this;
      (async function poll(){
        let request = await $this.getClientCandidate();
        if(request === null){
          setTimeout(poll,1000)
        } else resolve(request);
      })();
    });
  }

  this.waitForClientAnswer = () => {
    return new Promise(resolve => {
      let $this = this;
      (async function poll(){
        let request = await $this.getClientAnswer();
        if(request === null){
          setTimeout(poll,1000)
        } else resolve(request);
      })();
    });
  }

}