pragma solidity  0.4.24;

/*
Address of patient is considered as unique identification number for all the form fill.
*/
contract Insurance{
   
//intialise the hospital  address as fixed

address public h1 =0xb1D8c41F5456461be02Fb630bAa09cEAb2694C28;
//hard code it as last account of ganache

//registration of patient into blockchain

    struct Patients {
        string p_name;
        uint age;
        string gender;
        string h_add;
        string email;
        uint256 phone;

       
       
       // bool signed;
    }
   struct Bill{
        uint bill_id;
        string date;
        string hospital_name;
        string bp;
        string sugar;
        string serious_illness;
   }
// patient buys the policy

    struct Policys{
        string policy_type;      //a b c and for others is zero
        uint policy_id;         // this will be generated automatically
        uint coverage;      //this will be automatically assigned upon choosing the type
        bool claimed;
        uint p_count;
        string status;
    }
   
//the storage of patient details from hospital side so hospital account is used

    struct Hospital{
        uint policy_id;          //the autogenrated id should be sent here
        string name;             //patient name
        uint bill_id;           // patients checkup id
        string description;     //what happened to patient
        uint total_amount;      // cost of hospitality
        bool signed;
       
    }
   
// a default value preset during deploying

     constructor() public payable {
        owner = msg.sender;
        //startTime = now;
    }
   
//owner cant be patient

     modifier notOwner() {
        require(msg.sender != owner && msg.sender != h1 );
        _;
    }
   
// p_accounts give a set of accounts registered as patient    

    mapping (address => Patients) patients;
    address[] public p_account;
     
/*
switch the account to patient account.
Data is stored and accessed according to the address of the sender.
you have to enter patients account address.
date is just a string which can be stored accordingly by front end.
*/
    function setPatients(address _address, string _p_name , uint _age,string _gender,
    string _h_add,string _email,uint256 _phone
    ) public notOwner{
       
        var patient = patients[_address];
       
        patient.p_name =_p_name;
        patient.age = _age;
        patient.gender = _gender;
        patient.h_add = _h_add;
        patient.email = _email;
        patient.phone = _phone;

        p_account.push(_address) -1;
    }
   
    mapping (address => Bill) bills;
    address[] public b_account;
   
    function setBill(address _address,uint _bill_id, string _date ,
    string _hospital_name, string _bp, string _sugar,
    string _serious_illness)public notOwner{
        var bill = bills[_address];
       
        bill.bill_id = _bill_id;
        bill.date = _date;
        bill.hospital_name = _hospital_name;
        //patient.signed = true;
        bill.bp = _bp;
        bill.sugar = _sugar;
        bill.serious_illness = _serious_illness;
        b_account.push(_address) -1;
    }
   
// gives array of registered patients in chain  

    function getPatients() view public returns(address[]) {
        return p_account;
    }
   
//gives the details of the patients when account address is specified  

    function getPatientsByAddress(address _address) view public returns (
        string, uint,string,string,string,uint256
        ) { return ( patients[_address].p_name, patients[_address].age,
    patients[_address].gender,patients[_address].h_add,
    patients[_address].email,patients[_address].phone


    );
    }
   
    function getBillByAddress(address _address) view public returns (
    uint, string,string,string,string,string
     ) {return (bills[_address].bill_id, bills[_address].date ,
     bills[_address].hospital_name, bills[_address].bp,
     bills[_address].sugar,
     bills[_address].serious_illness
    ) ;
    }
   
     function getbills() view public returns(address[]) {
        return b_account;
    }
   
/*
switch the account to patient account.
Data is stored and accessed according to the address of the sender.
you have to choose a or b or c as policy type.
the coverage amount is automatically given considering the policy type taken.
A random policy id is generated, this is the most important during claiming process.
*/

    mapping (address => Policys) policys;
    mapping(uint=>Policys) policyids;
    address[] public policys_acc;
 
// address of the patient is used to choose the policy type.

    function setPolicys(address _address, string _policy_type ) public {
        var policy = policys[_address];
        //require(patients[_address]);
        policy.policy_type = _policy_type;
        policy.policy_id = random();
        policyids[policy.policy_id].coverage = compareStrings(_policy_type);
        policyids[policy.policy_id].claimed = true;//so now he can claim after paying two times premium
        policy.p_count = 0;
       
        policys_acc.push(_address)-1;
    }

/*
random unique number is generated, value not greater than 251 for policy id.
keccak256 a hashing function.
*/
    function random() private view returns (uint8) {
       return uint8(uint256(keccak256(block.timestamp, block.difficulty))%251);
   }
   
   
/*
the type of policy choosen is compared
and then the coverage value is returned to the set policy function
The coverage value are in wei uint
1 ether is 10^18wei
*/

     function compareStrings (string memory a) public view
       returns (uint256){
        if (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked(("a"))) == true)
            return 3*(10**18);
        else if (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked(("b"))) == true)
            return 2*(10**18);
        else if (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked(("c"))) == true)
            return 1*(10**18);
        else
        return 0;
       }
       
/*
msg.value needs to be given a particular ether for transfering of ether with accounts
The premium should be paid by the patient to onwer i.e Insurance people
the premium at the moment is considered as 1:3
if 10 is the coverage premium is 1/3rd of 10
*/
     function premimum( address _address) payable public returns(uint256){
       
        require(policys[_address].p_count<2);
        policys[_address].p_count++;
        //am= policys[_address].coverage;
        //owner.transfer(policys[_address].coverage);
        owner.transfer(msg.value);
        return policys[_address].p_count;
    }

/*
The balance of contract is shown here.
this is the amount that would be used for transaction
*/
    function getbalance() public view returns(uint256){
        return address(this).balance;
    }

/*
gives the registered patients list
*/

    function getPolicys() view public returns(address[]) {
        return policys_acc;
    }

/*
gives the details of patients policy
*/
    function getPolicysByAddress(address _address) view public returns (string,uint,uint,bool,uint,string){
        var policy = policys[_address];
        return ( policys[_address].policy_type, policys[_address].policy_id, policyids[policy.policy_id].coverage, policyids[policy.policy_id].claimed,policys[_address].p_count,policys[_address].status);
    }
   
   function getP_count(address _address) view public returns (uint){
        return (policys[_address].p_count);
    }
     function getP_claimed(address _address) view public returns (bool){
     
      var policy = policys[_address];
      return(policyids[policy.policy_id].claimed);
    }
/*
only hospital address can be used to feed patient data
*/
   
    address public owner;

    modifier onlyhosp() {
        require(msg.sender == h1);
         
        _;
    }

 
    mapping (address => Hospital) hospitals;
    address[] public h_account;
 
/*
switch account to hospital account
the details of patient is feed also the address of patient
the policy id given when policy is generated is only taken
*/

    function setHospitals(address _address,uint _policy_id, string _name , uint _bill_id, string _description ,uint _total_amount) public onlyhosp {
        var policy = policys[_address];
        require(policyids[policy.policy_id].claimed);
        require(policy.policy_id==_policy_id);
        require(policyids[policy.policy_id].coverage>=_total_amount);

        require((keccak256(abi.encodePacked((policyids[policy.policy_id].status))))==(keccak256(abi.encodePacked(("")))));
        policyids[policy.policy_id].status ="hop";
       
        var hospital = hospitals[_address]; //address of patient
        hospital.policy_id = _policy_id;
        hospital.name =_name;
        hospital.bill_id = _bill_id;
        hospital.description = _description;
        hospital.total_amount = _total_amount;
        hospital.signed = true;
       
        h_account.push(_address) -1;
    }
   
/*
PatientsRemburseSubmision form
switch to patient account enter details similar ti setpatients
*/

   
   function PatientsRemburseSubmision (address _address,uint _policy_id, string _name , uint _bill_id, string _description ,uint _total_amount) public notOwner{
       var policy = policys[_address];
       require(policyids[policy.policy_id].claimed);
       require(policy.policy_id==_policy_id);
       require(policyids[policy.policy_id].coverage>=_total_amount);
       
      require((keccak256(abi.encodePacked((policyids[policy.policy_id].status))))==(keccak256(abi.encodePacked(("")))));
       policyids[policy.policy_id].status ="self";
       
       var hospital = hospitals[_address]; //address of patient
        hospital.policy_id = _policy_id;
        hospital.name =_name;
        hospital.bill_id = _bill_id;
        hospital.description = _description;
        hospital.total_amount = _total_amount;
       
        hospital.signed=false;
        h_account.push(_address) -1;
    }

/*
switch to hospital
its approved seeing the patient being legitimate
*/

    function  signRembursement(address _address,uint256 _policyid) public onlyhosp{
        require(policys[_address].policy_id==_policyid);
        hospitals[_address].signed=true;
    }
   
/*
this function checks if the patients policy id matches with the one he buyed
if its true then only the claim proccess should be allowed
this is to be connected in front end
*/

     function checkpolicy_id(address _address) view public returns (bool){
        if(policys[_address].policy_id ==hospitals[_address].policy_id)
        //changes();
        return true;
        else
        return false;
    }

/*
the list of hospital patients accounts registered is shown
*/
   
    function getHospitals() view public returns(address[]) {
        return h_account;
    }

/*
the data entered by hopital admin can be accessed using patient addresss
*/
   
    function getHospitalsByAddress(address _address) view public returns (uint, string, uint, string, uint,bool) {
        return (hospitals[_address].policy_id, hospitals[_address].name, hospitals[_address].bill_id, hospitals[_address].description, hospitals[_address].total_amount,hospitals[_address].signed);
    }
   
/*
switch to owner account
the claim is processed only by the owner i.e Insurance
*/
   
    uint256 startTime;

/*
timestamp code
modifier onlyWhileOpen() {
        require(block.timestamp >= startTime+30);
        _;
    }
*/
   
     modifier onlyInsure() {
        // onlyWhileOpen;
        // require(block.timestamp >= startTime+30);
        require( msg.sender == owner);
        _;
    }

/*
msg.value needs to set so that it will be sent to contract
for transerfing of ether from owner to patient account
fallback function
*/
   
    function ()  payable public {
       
    }
   /*
   function checkdesp(address _address) view public returns (string){
       if((keccak256(abi.encodePacked(hospitals[_address].description)))==(
       (keccak256(abi.encodePacked(("jaundice")))) || (keccak256(abi.encodePacked(("dengue"))))||
        (keccak256(abi.encodePacked(("malaria"))))))
        {
             return "c";
        }
        if ((keccak256(abi.encodePacked(hospitals[_address].description)))==(
       (keccak256(abi.encodePacked(("heart attack")))) || (keccak256(abi.encodePacked(("Preganent"))))||
        (keccak256(abi.encodePacked(("kidney stroke"))))))
        {
            return "b";
           
        }
            if ((keccak256(abi.encodePacked(hospitals[_address].description)))==(
       (keccak256(abi.encodePacked(("cancer")))) || (keccak256(abi.encodePacked(("covid 19"))))||
        (keccak256(abi.encodePacked(("brain hemarge"))))))
        {
            return "a";
           
        }
         
       
        else{
            return 'd';
        }
   }
   function check(address _address) view public returns(bool){
       if(keccak256(abi.encodePacked((policys[_address].policy_type)))==keccak256(abi.encodePacked(("a")))
       &&
       (keccak256(abi.encodePacked((checkdesp(_address))))==(keccak256(abi.encodePacked(("a"))) ||
       keccak256(abi.encodePacked(("b")))||keccak256(abi.encodePacked(("c")))))
       ){
           return true;
       }
       else
       if(keccak256(abi.encodePacked((policys[_address].policy_type)))==keccak256(abi.encodePacked(("b")))
       &&
       (keccak256(abi.encodePacked((checkdesp(_address))))==(
       keccak256(abi.encodePacked(("b")))||keccak256(abi.encodePacked(("c")))))
       ){
           return true;
       }
       else
       if(keccak256(abi.encodePacked((policys[_address].policy_type)))==keccak256(abi.encodePacked(("c")))
       &&
       (keccak256(abi.encodePacked((checkdesp(_address))))==(
       keccak256(abi.encodePacked(("c")))))
       ){
           return true;
       }
       else
       false;
   }
   */
/*
claim the account is insurance and after double click the amount is reflected to patient
*/

    function claim(address _address) payable public onlyInsure {
        var policy = policys[_address];
        require(policyids[policy.policy_id].coverage>= hospitals[_address].total_amount);
        require(policys[_address].p_count==2);
        require(hospitals[_address].signed);
        require(policyids[policy.policy_id].claimed);
        require(checkpolicy_id(_address));
        if(keccak256(abi.encodePacked(policyids[policy.policy_id].status))== keccak256(abi.encodePacked("hop"))){
            h1.transfer(hospitals[_address].total_amount);
        }
        else if(keccak256(abi.encodePacked(policyids[policy.policy_id].status))== keccak256(abi.encodePacked("self"))){
        _address.transfer(hospitals[_address].total_amount);
        }
       policyids[policy.policy_id].claimed=false;//so now he has claimed cant claim again
       
    }
 
}

/*
basic flow:
..deploy under insurance account
..patient account
    1. setPatients
    2. setPolicys
    3. getPolicys
msg.value set to some ether approx 10
    4. premium
..hospital account
    5. setHospitals or PatientsRemburseSubmision
    6. checkpolicy_id -true contine else no claim (to be implemented in front end) or signRembursement
..insurance account
msg.value set to some ether approx 10    
    7. fallback
    8. claim
*/

/*
added features:
    1. getPatients
    2. getHospitals
    3. getbalance
*/