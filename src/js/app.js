
App = {
  web3Provider: null,
  contracts: {},

  init: function() {

    console.log("init:");
    
    return App.initWeb3();
  },

  initWeb3: function() {
    
    console.log("initWeb3:");

    //App.policyHolders.push("aaa");
    //console.log(App.policyHolders[0]);  
    // Check for injected web3 instance?
    if (typeof web3 !== 'undefined') {
      ethereum.enable();
      App.web3Provider = web3.currentProvider;
    } else {
      ethereum.enable();
      // If no injected web3 instance is detected, use Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  //till here no problem
  
  
  
  initContract: function() {
    $.getJSON('Insurance.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var InsuranceArtifact = data;
      App.contracts.Insurance = TruffleContract(InsuranceArtifact);

      // Set the provider for our contract
      App.contracts.Insurance.setProvider(App.web3Provider);
      return App.render();
    });

   // return App.bindEvents();
   
  },

  render:function(){
    var InsuranceInstance;
    var loader=$("#loader");
    var content=$("#content");
    var OwnerAccess=$('#OwnerAccess');
    var OtherUserAccess=$('#OtherUserAccess');
    var Hospital=$('#HospitalAccess');
    loader.show();
    content.hide();
    OwnerAccess.hide();
    OtherUserAccess.hide();
    Hospital.hide();
    web3.eth.getCoinbase(function(err,account){
      if(err==null){
        App.account=account;
        $("#accountAddress").html("Your account :"+App.account);
      }      
          loader.hide();
           content.show();
            OwnerAccess.hide();
            OtherUserAccess.hide();
            Hospital.hide();
         });

    web3.eth.getTransactionFromBlock(1, function(error, result){
      if(!error){
        
        App.owner_address=result.from;
        $('#OwnerAdderss').html("Owner address :"+App.owner_address);
        }
      else
        console.error(error);   
       });  
       
       App.contracts.Insurance.deployed().then(function(i){
        console.log(i);
        InsuranceInstance=i;
        var h1=InsuranceInstance.h1();
        console.log(h1);
        h1.then(function(haddr){
          console.log(haddr);
          App.hospital=haddr;
        })
       });

        App.contracts.Insurance.deployed().then(function(i){
          InsuranceInstance=i;
          var claimed=InsuranceInstance.getP_claimed(App.account);
          claimed.then(function(value){
              var Patient=InsuranceInstance.getPatientsByAddress(App.account);
              Patient.then(function(name){
              var random_number=InsuranceInstance.getPolicysByAddress(App.account);
              random_number.then(function(rn){
                  var premium_count=InsuranceInstance.getP_count(App.account);
                  premium_count.then(function(p_count){
                    var bill_id=InsuranceInstance.getBillByAddress(App.account);
                    bill_id.then(function(bill_id){
                    if(name[0]!=""){
                      if(bill_id[0].toNumber()!=0){
                        $('#FillPreCheckUp').hide();
                        $('#ViewPreCheckUpDetails').show();
                    if(rn[1].toNumber()!=0){
                      if(value){
                        if(p_count.toNumber()<2){
                          $('#PayPremium').show();
                          $('#BuyPolicy').hide();
                          $('#PatientRembursement').hide();
                          $('#Status').html("Pay Premium twice");
                        }
                        else{
                          $('#BuyPolicy').hide();
                          $('#PayPremium').hide();
                          $('#PatientRembursement').show();
                          $('#Status').html("Fill rembursement yourself or Wait for hospital to claim it");
                        }
                      }
                      else{

                        $('#BuyPolicy').show();
                      $('#PayPremium').hide();
                      $('#PatientRembursement').hide();
                      $('#Status').html("Buy Policy");
                      }
                    }
                    else{
                      $('#BuyPolicy').show();
                      $('#PayPremium').hide();
                      $('#PatientRembursement').hide();
                      $('#Status').html("Buy Policy");  
                    }
                  }
                  else{
                    $('#FillPreCheckUp').show();
                    $('#ViewPreCheckUpDetails').hide();
                    $('#PayPremium').hide();
                    $('#PatientRembursement').hide();
                    $('#BuyPolicy').hide();
                    $('#Status').html("Enter Pre Check up details");
                  }
                }               
                  else{
                    $('#Status').html("Please register");
                    $('#PayPremium').hide();
                    $('#PatientRembursement').hide();
                    $('#BuyPolicy').hide();
                    $('#FillPreCheckUp').hide();
                    $('#ViewPreCheckUpDetails').hide();
                  }
                  });
                });
              });
            });
          });
          }).then(function(res){
            console.log(res);
          }).catch(function(err) {
            console.log(err.message);
          });

    $(document).on('click','#Login',App.ShowHide);
    $(document).on('click', '#submit', App.setpolicy);
    $(document).on('click', '#SubmitPatient', App.setPatients);
    $(document).on('click','#SubmitBill',App.setPreCheckUp);
    $(document).on('click', '#submitHospital', App.setHospitals);
    $(document).on('click', '#submitReumburse', App.setPatientsRemburseSubmision);
    $(document).on('click','#ViewMyPolicies',App.ViewMyPolicies);
    $(document).on('click','#ViewMyDetails',App.ViewMyDetails); 
    $(document).on('click','#ViewAllPolicies',App.ViewAllPolicies);  
    $(document).on('click','#ViewAllClaims',App.ViewAllClaims);   
    $(document).on('click','#PayPremium',App.PayPremium);
    $(document).on('click','#Claim',App.Claims);
    $(document).on('click','#SignRembursements',App.SignRembursements);
    $(document).on('click','#Sign',App.doSign);
    $(document).on('click','#Mail',App.Mail);
    $(document).on('click','#ViewPreCheckUpDetails',App.ViewMyBillDetails);  
  },
  Mail:function(){
    var dataSent = {
      name:"pavan"
    }
    jQuery.ajax({
      url:'http://localhost:3002/sendmail' ,
      type: "POST",
      data: JSON.stringify({name: "amit", id:1 }),
      dataType: "json",
      contentType:"application/json; charset=utf-8",
      traditional:true,
      success: function(result) {
    //Write your code here
      }
});;  

  },

  ShowHide:function(){
    var OwnerAccess=$('#OwnerAccess');
    var OtherUserAccess=$('#OtherUserAccess');
    var Hospital=$('#HospitalAccess');
    var Entity=$("#Entity");
    $('#Login').hide();
    
    if(App.account==App.owner_address){
      Entity.html("You are a OWNER");
      OwnerAccess.show();
      OtherUserAccess.hide();
      Hospital.hide();
    }
    else if(App.account==App.hospital){
      Entity.html("You are a HOSPITAL");
      OwnerAccess.hide();
      OtherUserAccess.hide();
      Hospital.show();
    }
    else{
      Entity.html("You are a PATIENT");
      OwnerAccess.hide();
      OtherUserAccess.show();
      Hospital.hide();
    }
    console.log(App.account);
    console.log(App.owner_address);
  },

   setpolicy:function(){
    App.contracts.Insurance.deployed().then(function(i){
      InsuranceInstance=i;
      var _address=$("#address").val();
      var _policy_type=$("#policy_type").val();
      console.log(_address);
      console.log(_policy_type);
      return InsuranceInstance.setPolicys(_address,_policy_type);
    }).then(function(){
      $("#s").html("Function set Policys called");
    }).catch(function(err) {
      console.log(err.message);
    });

  },
  setPatients:function(){
    App.contracts.Insurance.deployed().then(function(i){
      InsuranceInstance=i;
      var _address=$("#address1").val();
      var _p_name=$("#p_name").val();
      var _age=$("#age").val();
      var _gender=$("#gender").val();
      var house_address=$("#house_address").val();
      var state=$("#state").val();
      var country=$("#country").val();
      var pin_code=$("#pin_code").val();
      var _email=$("#email").val();
      var _phoneno=$("#phoneno").val();
      var full_address=""+house_address+","+state+","+country+","+pin_code;
      console.log(_address);
      console.log(_p_name);
      console.log(_age);
      console.log(_gender);
      console.log(full_address);
      console.log(_email);
      console.log(_phoneno);
      return InsuranceInstance.setPatients(_address,_p_name,_age,_gender,full_address,_email,_phoneno);
    }).then(function(){
      console.log("Function set Patients called");
    }).catch(function(err) {
      console.log(err.message);
    });
  },
  setPreCheckUp:function(){
    App.contracts.Insurance.deployed().then(function(i){
      InsuranceInstance=i;
      var _bill_address=$("#bill_address").val();
      var _bill_id=$("#bill_id").val();
      var _bill_date=$("#bill_date").val();
      var _hospital_name=$("#hospital_name").val();
      var _bp=$("#bp").val();
      var _sugar=$("#sugar").val();
      var _serious_illness=$("#serious_illness").val();
      console.log(_bill_address);
      console.log(_bill_id);
      console.log(_bill_date);
      console.log(_hospital_name);
      console.log(_bp);
      console.log(_sugar);
      console.log(_serious_illness);
      return InsuranceInstance.setBill(_bill_address,_bill_id,_bill_date,_hospital_name,_bp,_sugar,_serious_illness);
    }).then(function(res){
      console.log(res);
      console.log("Function set Bills called");
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  setHospitals:function(){
    App.contracts.Insurance.deployed().then(function(i){
      InsuranceInstance=i;
      var _address2=$("#address2").val();
      var _policy_id=$("#policy_id").val();
      var _name1=$("#name1").val();
      var _bill_id1=$("#bill_id1").val();
      var _description=$("#description").val();
      var _total_amount=$("#total_amount").val();
      _total_amount=web3.toWei(_total_amount,'ether');
      console.log(_address2);
      console.log(_policy_id);
      console.log(_name1);
      console.log(_bill_id1);
      console.log(_description);
      console.log(_total_amount);
      return InsuranceInstance.setHospitals(_address2,_policy_id,_name1,_bill_id1,_description,_total_amount);
    }).then(function(){
      console.log("Function set Hospitals called");
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  setPatientsRemburseSubmision:function(){
    App.contracts.Insurance.deployed().then(function(i){
      InsuranceInstance=i;
      var _address3=$("#address3").val();
      var _policy_id1=$("#policy_id1").val();
      var _name2=$("#name2").val();
      var _bill_id2=$("#bill_id2").val();
      var _description1=$("#description1").val();
      var _total_amount1=$("#total_amount1").val();
      _total_amount1=web3.toWei(_total_amount1,'ether');
      console.log(_address3);
      console.log(_policy_id1);
      console.log(_name2);
      console.log(_bill_id2);
      console.log(_description1);
      console.log(_total_amount1);
      return InsuranceInstance.PatientsRemburseSubmision(_address3,_policy_id1,_name2,_bill_id2,_description1,_total_amount1);
    }).then(function(){
      console.log("Function set PatientsRemburseSubmision called");
    }).catch(function(err) {
      console.log(err.message);
    });
  },
  ViewMyPolicies:function(){
    App.contracts.Insurance.deployed().then(function(i) {
      InsuranceInstance=i;
      return InsuranceInstance.getPolicysByAddress(App.account);
    }).then(function(policyAddress){
      var policytable=$("#policytable");
      policytable.show();
      policytable.empty();
      var row='<thead><tr><th>Column</th><th>Your details</th></tr></thead>';
      row+='<tbody>';
      row+='<tr><td>Policy Type</td><td>'+policyAddress[0]+'</td></tr>';
      row+='<tr><td>Policy ID</td><td>'+policyAddress[1]+'</td></tr>';
      row+='<tr><td>Coverage</td><td>'+web3.fromWei(policyAddress[2].toNumber(),'ether')+'</td></tr>';
      row+='<tr><td>Claim Status</td><td>'+policyAddress[3]+'</td></tr>';
      row+='<tr><td>Premium Paid Count</td><td>'+policyAddress[4]+'</td></tr>';
      row+='</tbody>';
      policytable.append(row);
      policytable.append('<button type="button" class="btn btn-info" id="Close_policy_details">Close</button>');
      }).catch(function(err) {
        console.log(err.message);
      });
      
      $(document).on('click','#Close_policy_details',function(){
        $('#policytable').hide();
      });


  },
  ViewMyDetails:function(){  
    App.contracts.Insurance.deployed().then(function(i){
      InsuranceInstance=i;
      return InsuranceInstance.getPatientsByAddress(App.account);
    }).then(function(res){
      var viewdetails=$('#Details');
      viewdetails.show();
      viewdetails.empty();
      var row='<thead><tr><th>Column</th><th>Your details</th></tr></thead>';
      row+='<tbody>';
      row+='<tr><td>Name</td><td>'+res[0]+'</td></tr>';
      row+='<tr><td>Age</td><td>'+res[1].toNumber()+'</td></tr>';
      row+='<tr><td>Gender</td><td>'+res[2]+'</td></tr>';
      row+='<tr><td>House address</td><td>'+res[3]+'</td></tr>';
      row+='<tr><td>E mail</td><td>'+res[4]+'</td></tr>';
      row+='<tr><td>Phone no</td><td>'+res[5].toNumber()+'</td></tr>'; 
      row+='</tbody>';
      viewdetails.append(row);
      viewdetails.append('<button type="button" class="btn btn-info" id="Close_details">Close</button>');
    }).catch(function(err) {
      console.log(err.message);
    });
    
    $(document).on('click','#Close_details',function(){
      $('#Details').hide();
    });
  },
  ViewMyBillDetails:function(){
    App.contracts.Insurance.deployed().then(function(i){
      InsuranceInstance=i;
      return InsuranceInstance.getBillByAddress(App.account);
    }).then(function(res){
      var billdetails=$('#BillTable');
      billdetails.show();
      billdetails.empty();
      var row='<thead><tr><th>Column</th><th>Your details</th></tr></thead>';
      row+='<tbody>';
      row+='<tr><td>Bill ID</td><td>'+res[0].toNumber()+'</td></tr>';
      row+='<tr><td>Bill Date</td><td>'+res[1]+'</td></tr>';
      row+='<tr><td>Hospital Name</td><td>'+res[2]+'</td></tr>';
      row+='<tr><td>Blood Pressure Level</td><td>'+res[3]+'</td></tr>';
      row+='<tr><td>Blood Sugar Level</td><td>'+res[4]+'</td></tr>';
      row+='<tr><td>Serious Illness</td><td>'+res[5]+'</td></tr>'; 
      row+='</tbody>';
      billdetails.append(row);
      billdetails.append('<button type="button" class="btn btn-info" id="Close_details">Close</button>');
    }).catch(function(err) {
      console.log(err.message);
    });
    
    $(document).on('click','#Close_details',function(){
      $('#BillTable').hide();
    });
  },
  ViewAllPolicies:function(){
    App.contracts.Insurance.deployed().then(function(i) {
      InsuranceInstance=i;
      var allAddress= InsuranceInstance.getPolicys();
      allAddress.then(function(policyAddresses){
      console.log(policyAddresses);
      var policytable=$("#policyAlltable");
      policytable.empty();
      policytable.show();
      var uniqueArray=Array.from(new Set(policyAddresses));
      for(var i=0;i<uniqueArray.length;i++){
        runFuncPolicy(uniqueArray[i]);
      }
      function runFuncPolicy(param1) { 
            InsuranceInstance.getPolicysByAddress(param1).then(function(result){
            var row='<thead><tr><th>Column</th><th>Your details</th></tr></thead>'; 
            row+='<tbody>';
            row+="<tr><td>Address</td><td>"+param1+"</td>";
            row+='<tr><td>Policy Type</td><td>'+result[0]+'</td></tr>';
            row+='<tr><td>Policy ID</td><td>'+result[1]+'</td></tr>';
            row+='<tr><td>Coverage</td><td>'+web3.fromWei(result[2].toNumber(),'ether')+'</td></tr>';
            row+='<tr><td>Claim Status</td><td>'+result[3]+'</td></tr>';
            row+='<tr><td>Premium Paid Count</td><td>'+result[4]+'</td></tr>';
            row+='</tbody>';
            policytable.append(row);         
        });
    }
      policytable.append('<br><button type="button" class="btn btn-info" id="Close_policy_details">Close</button>');
  });
      }).catch(function(err) {
        console.log(err.message);
      });
      
      $(document).on('click','#Close_policy_details',function(){
        $('#policyAlltable').hide();
      });
  },
  ViewAllClaims:function(){
      App.contracts.Insurance.deployed().then(function(i) {
      InsuranceInstance=i;
      var allAddress= InsuranceInstance.getHospitals();
      allAddress.then(function(claimAddresses){
      console.log(claimAddresses);
      var claimstable=$("#AllClaimTable");
      claimstable.empty();
      claimstable.show();
      var uniqueArray=Array.from(new Set(claimAddresses));
      claimstable.append('<button type="button" class="btn btn-info" id="Claim">Claim</button> <input type="text" class="form-control" id="ClaimAddress"  >');
      for(var i=0;i<uniqueArray.length;i++){
            console.log(uniqueArray[i]);
            runFunc(uniqueArray[i]);
          }        
      function runFunc(param1){
        InsuranceInstance.getP_count(param1).then(function(return1) {
          InsuranceInstance.getP_claimed(param1).then(function(return2) {
            InsuranceInstance.getHospitalsByAddress(param1).then(function(return3){
              if(return1.toNumber()==2){
                if(return2){
                  if(return3[5]){
                    var row='<thead><tr><th>Column</th><th>Your details</th></tr></thead>'; 
                    row+='<tbody>';
                    row+="<tr><td>Address</td><td>"+param1+"</td>";
                    row+='<tr><td>Policy ID</td><td>'+return3[0].toNumber()+'</td></tr>';
                    row+='<tr><td>Patient Name</td><td>'+return3[1]+'</td></tr>';
                    row+='<tr><td>Bill ID</td><td>'+return3[2].toNumber()+'</td></tr>';
                    row+='<tr><td>Description</td><td>'+return3[3]+'</td></tr>';
                    row+='<tr><td>Treatment Cost</td><td>'+web3.fromWei(return3[4].toNumber(),'ether')+'</td></tr>';
                    row+='<tr><td>Signed status</td><td>'+return3[5]+'</td></tr>';
                    row+='</tbody>';
                    claimstable.append(row); 
                  }
                }
              }
            });
            });
        });
    }
      
      
      claimstable.append('<br><button type="button" class="btn btn-info" id="Close_policy_details">Close</button><br>');
     
      });
      }).catch(function(err) {
        console.log(err.message);
      });
      
      $(document).on('click','#Close_policy_details',function(){
        $('#AllClaimTable').hide();
      });
  },
  SignRembursements:function(){
    App.contracts.Insurance.deployed().then(function(i) {
      InsuranceInstance=i;
      var alladdress=InsuranceInstance.getHospitals();
      alladdress.then(function(claimAddresses){
      console.log(claimAddresses);
      var unsignedtable=$("#UnSignedTable");
      unsignedtable.empty();
      unsignedtable.show();
      var uniqueArray=Array.from(new Set(claimAddresses));
      unsignedtable.append('<button type="button" class="btn btn-info" id="Sign">Sign</button> <input type="text" class="form-control" id="SignAddress" /><br><input type="text" class="form-control" id="PolicyID" />');
      for(var i=0;i<uniqueArray.length;i++){
        console.log(uniqueArray[i]);
        runFuncSign(uniqueArray[i]);
      }
      function runFuncSign(param1) { 
        InsuranceInstance.getP_count(param1).then(function(return1) {
          InsuranceInstance.getP_claimed(param1).then(function(return2) {
            InsuranceInstance.getHospitalsByAddress(param1).then(function(return3){
              if(return1.toNumber()==2){
                if(return2){
                  if(!return3[5]){
                    var row='<thead><tr><th>Column</th><th>Your details</th></tr></thead>';
                    row+='<tbody>';
                    row+="<tr><td>Address</td><td>"+param1+"</td>";
                    row+='<tr><td>Policy ID</td><td>'+return3[0].toNumber()+'</td></tr>';
                    row+='<tr><td>Patient Name</td><td>'+return3[1]+'</td></tr>';
                    row+='<tr><td>Bill ID</td><td>'+return3[2].toNumber()+'</td></tr>';
                    row+='<tr><td>Description</td><td>'+return3[3]+'</td></tr>';
                    row+='<tr><td>Treatment Cost</td><td>'+web3.fromWei(return3[4].toNumber(),'ether')+'</td></tr>';
                    row+='<tr><td>Signed status</td><td>'+return3[5]+'</td></tr>';
                    row+='</tbody>';
                    unsignedtable.append(row);  
                  }
                }
              }
            });
            });
        });
    }
      unsignedtable.append('<br><button type="button" class="btn btn-info" id="Close">Close</button>');
    });
      }).catch(function(err) {
        console.log(err.message);
      });
      
      $(document).on('click','#Close',function(){
        $("#UnSignedTable").hide();
      });
  },
  doSign:function(){
    var signaddress=$('#SignAddress').val();
    var policyid=$('#PolicyID').val();
    App.contracts.Insurance.deployed().then(function(i) {
      InsuranceInstance=i;
      return InsuranceInstance.signRembursement(signaddress,policyid);
  }).then(function(res){
    console.log(res);
  }).catch(function(err) {
    console.log(err.message);
  });

  },
  PayPremium:function(){ 
    /*
     web3.eth.sendTransaction({
        from:App.account,
        to:App.owner_address,
       value:'2000000000000000000'
      },function(err,result){
        console.log(result);
      });
    */
      App.contracts.Insurance.deployed().then(function(i){
      InsuranceInstance=i;
      var premium_Count=InsuranceInstance.getP_count(App.account);
  
      premium_Count.then(function(count){
        if(count.toNumber()!=2){
        InsuranceInstance.premimum(App.account);
        var amount;
        var coverage=InsuranceInstance.getPolicysByAddress(App.account);
        coverage.then(function(cov){
          amount=cov[2].toNumber();
          console.log("amount="+amount*0.1);
          return web3.eth.sendTransaction({
            from:App.account,
             to:App.owner_address,
           value:amount*0.1
          },function(err,result){
          console.log(result);
       });
        });  
      }
      else{
        $('#PayPremium').hide();
        return;
      }
      });
    }).then(function(res){
      console.log(res);
    }).catch(function(err) {
      console.log(err.message);
    }); 
    },
  Claims:function(){
    var claimaddress=$('#ClaimAddress').val();
      App.contracts.Insurance.deployed().then(function(i) {
      InsuranceInstance=i;
      var claimed_amount=InsuranceInstance.getHospitalsByAddress(claimaddress);
      claimed_amount.then(function(claim_details){
        var policy_type=checkDesc(claim_details[3]);
        function checkDesc(param1){
            if(param1=="Dengue"||param1=="Jaundice"||param1=="Malaria"){
              return "c";
            }
            else if(param1=="Heart Attack"||param1=="Preganent"||param1=="Kidney Stone"){
              return "b";
            }
            else if(param1="Cancer"||param1=="Covid 19"||param1=="Brain Hemarge"){
              return "a";
            }
        }
        var Patient_PolicyType=InsuranceInstance.getPolicysByAddress(claimaddress);
        Patient_PolicyType.then(function(result){
          var value=check();
          function check(){
          if(result[0]=="a"&&((policy_type=="a"|| "b"||"c"))){
            return true;
          }
          else if(result[0]=="b"&&((policy_type=="b"||"c"))){
            return true;
          }
          else if(result[0]=="c"&&((policy_type=="c"))){
            return true;
          }
          else{
            return false;
          }
        }
        if(value){
          var amount=claim_details[4].toNumber();
          return InsuranceInstance.claim(claimaddress,{
          from:App.account,
          to:App.contracts.Insurance.address,
          value:amount
        });
        }
        else{
          alert("Wrong policy taken");
          console.log("error");
        }
        });
        
      }); 
    }).then(function(result){
      console.log("Success");
      console.log(result);
    }).catch(function(err) {
      console.log(err.message);
    }); 
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});


  /*bindEvents: function() {


    $(document).on('click', '.btn-register1', App.handleRegisterPolicyHolder);
    $(document).on('click', '.btn-register2', App.handleRegisterAppraiser);
    $(document).on('click', '.btn-register3', App.handleRegisterAdjuster);

    $(document).on('click', '.btn-open-claim', App.handleOpenClaim);
    $(document).on('click', '.btn-appraise-claim', App.handleAppraiseClaim);
    $(document).on('click', '.btn-approve-claim', App.handleApproveClaim);
    


    //$(document).on('click', '.btn-count', App.getCount);
  },

  handleOpenClaim: function(event) {
     accounts[0];
      console.log("account[0]: " + account);
      $("#account-number").text("Account # " + account);
 
      var firstName= $("#first-name").val();
      console.log("The first name is: " + firstName);


      App.contracts.Claims.deployed().then(function(instance) {
        claimsInstance = instance;

        // Execute 
        return claimsInstance.openClaim(firstName, {from: account});

      }).then(function(txHash){
        return claimsInstance.getClaimCount.call(); 
      }).then(function(response){
        console.log("Claim Number is: " + response);
        $("#number-of-claims").text("Number of Claims: " + response);

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleAppraiseClaim: function(event) {
   event.preventDefault();

    var claimsInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log("account[0]: " + account);
      $("#account-number").text("Account # " + account);
 
      var claimNumber= $("#appraisal-claim-number").val();
      var appraisalValue= $("#appraisal-value").val();
      console.log("Claim Number is : " + claimNumber);
      console.log("Appraisal Value is : " + appraisalValue);


      App.contracts.Claims.deployed().then(function(instance) {
        claimsInstance = instance;

        // Execute 
        return claimsInstance.appraiseClaim(claimNumber, appraisalValue, {from: account});

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

 handleApproveClaim: function(event) {
   event.preventDefault();

    var claimsInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log("account[0]: " + account);
      $("#account-number").text("Account # " + account);
 
      var claimNumber= $("#approval-claim-number").val();
      var approvalValue= $("#approval-value").val();
      console.log("Claim Number is : " + claimNumber);
      console.log("Approval Value is : " + approvalValue);


      App.contracts.Claims.deployed().then(function(instance) {
        claimsInstance = instance;

        // Execute 
        return claimsInstance.approveClaim(claimNumber, approvalValue, {from: account});

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },


  getCount: function(claimCount) {

    alert("get count function");

    var claimsInstance;

    App.contracts.Claims.deployed().then(function(instance) {
      claimsInstance = instance;

      return claimsInstance.getClaimCount.call();
    }).then(function(claimCount) {
        $('#count').text(claimCount);
        alert(claimCount);
      
    }).catch(function(err) {
      console.log(err.message);
    });
  },


  handleRegisterPolicyHolder: function(event) {
    event.preventDefault();
    var name = this.textContent;

    var claimsInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);
      $("#account-number").text("Account # " + account);

      App.policyHolders.push(account);

      App.contracts.Claims.deployed().then(function(instance) {
        claimsInstance = instance;

        // Execute register as a transaction by sending account
        return claimsInstance.registerPolicyHolder({from: account});
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  
  handleRegisterAppraiser: function(event) {
    event.preventDefault();
    var name = this.textContent;

    var claimsInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);
      $("#account-number").text("Account # " + account);

      App.appraisers.push(account);

      App.contracts.Claims.deployed().then(function(instance) {
        claimsInstance = instance;

        // Execute register as a transaction by sending account
        return claimsInstance.registerAppraiser({from: account});
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleRegisterAdjuster: function(event) {
    event.preventDefault();
    var name = this.textContent;

    var claimsInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);
      $("#account-number").text("Account # " + account);

      App.approvers.push(account);

      App.contracts.Claims.deployed().then(function(instance) {
        claimsInstance = instance;

        // Execute register as a transaction by sending account
        return claimsInstance.registerAdjuster({from: account});
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

*/
