pragma solidity ^0.5.0;

/**
 * @title IncomeAssignment
 * @notice IncomeAssignment controls the assignment of income share tokens
 **/
contract IncomeAssignment {

  // @notice Assignment defines the details of an assignment
  struct Assignment {
    address seller;
    address buyer;
    uint price;
    uint numTransferred;
    bool confirmed;
  }

  // @notice Event emitting Assignment details upon execution 
  event AssignmentExecuted (
    address _contract,
    address seller,
    address buyer,
    uint priceInEth,
    uint numTransferred
  );

  // Would be nice to have OL address passed into constructor for modifier use
  address openLaw;

  // @notice ERC20 address -> Assignment number -> Assignment
  mapping (address => mapping(uint => Assignment)) public assignmentHistory;

  // @notice ERC20 address -> Assignment index (defaults to 0)
  mapping (address => uint) public currAssignment; 

  constructor() public {
  }

   /**
   * @notice recordAssignment creates a new assignment 
   * @param _contract - the address of the tokenized ERC20 income shares 
   * @param _seller - address assigning tokens
   * @param _buyer - address receiving tokens
   * @param _price - price the buyer pays in Wei
   * @param _numTransferred - number of transferred shares
   */
  function recordAssignment(
    address _contract, 
    address _seller, 
    address _buyer, 
    uint _price, 
    uint _numTransferred) public {
    Assignment memory _assignment = Assignment({
      seller: _seller,
      buyer: _buyer,
      price: _price,
      numTransferred: _numTransferred,
      confirmed: false
    });

    uint _assignmentNo = currAssignment[_contract]++;
    
    assignmentHistory[_contract][_assignmentNo] = _assignment;

    emit AssignmentExecuted(_contract, _seller, _buyer, _price, _numTransferred);
  }

  function () external payable { }

/**
   * @notice executeAssignment is called by an seller to effect token transfer after receiving payment 
   * @param _contract - the address of the tokenized ERC20 income shares 
   * @param _assignmentNum - the particular Assignment's index for retrieval 
   */
  function executeAssignment(address _contract, uint _assignmentNum) public {

    ProofClaim pcToken = ProofClaim(_contract);

    uint sellerTokens = pcToken.balanceOf(msg.sender);
    
    Assignment memory _assignment = assignmentHistory[_contract][_assignmentNum];

    require (msg.sender == _assignment.seller, "only seller can confirm");
    require (sellerTokens >= _assignment.numTransferred, "seller does not have enough tokens to assign");

    // transfer pre-approved token balance from seller to buyer by calling Token smart contract
    require(pcToken.transferFrom(_assignment.seller, _assignment.buyer, _assignment.numTransferred), "transfer unsuccessful");

    _assignment.confirmed = true;

    // update the Assignment w/ confirmed = true
    assignmentHistory[_contract][_assignmentNum] = _assignment; 
  }

/**
   * @notice getNumAssignments returns the number of assignments made for a token  
   * @param _contract - the address of the tokenized ERC20 income shares 
   */
  function getNumAssignments(address _contract) public view returns (uint) {
    return currAssignment[_contract];
  }

  function getAssignmentNoByAddress(address _contract) public view returns (uint[] memory){
    uint numAssignments = currAssignment[_contract];
    uint[] memory assignmentNos = new uint[](numAssignments);

    for(uint i = 0; i < numAssignments; i++) {
      Assignment memory assignment = assignmentHistory[_contract][i];
      if(assignment.seller == msg.sender || assignment.buyer == msg.sender) {
        assignmentNos[i] = i;
      } else {
        assignmentNos[i] = 0;
      }
    }
    return assignmentNos;
  }

/**
   * @notice getAssignment returns the details of an Assignment 
   * @param _contract - the address of the tokenized ERC20 income shares 
   * @param _assignmentNum - the particular Assignment's index for retrieval 
   */
  function getAssignment(address _contract, uint _assignmentNum) public view returns (  
    address seller,
    address buyer,
    uint price,
    uint numTransferred,
    bool confirmed) {
    
    Assignment memory _assignment = assignmentHistory[_contract][_assignmentNum];
    seller = _assignment.seller;
    buyer = _assignment.buyer;
    price = _assignment.price;
    numTransferred = _assignment.numTransferred;
    confirmed = _assignment.confirmed;
  }    
}

/**
 * @title ProofClaim
 * @notice Interface of ProofClaim ERC20 token to call its functions 
 **/
contract ProofClaim {
  
  function totalSupply() public view returns (uint);
  function balanceOf(address tokenOwner) public view returns (uint balance);
  function allowance(address tokenOwner, address spender) public view returns (uint remaining);
  function transfer(address to, uint tokens) public returns (bool success);
  function approve(address spender, uint tokens) public returns (bool success);
  function transferFrom(address from, address to, uint tokens) public returns (bool success);

  event Transfer(address indexed from, address indexed to, uint tokens);
  event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}