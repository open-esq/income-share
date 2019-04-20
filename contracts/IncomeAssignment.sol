pragma solidity ^0.5.0;

/**
 * @title IncomeAssignment
 * @notice IncomeAssignment controls the assignment of income share tokens
 **/
contract IncomeAssignment {

  // @notice Assignment defines the details of an assignment
  struct Assignment {
    address assignor;
    address assignee;
    uint price;
    uint numTransferred;
    bool confirmed;
  }

  // @notice Event emitting Assignment details upon execution 
  event AssignmentExecuted (
    address _contract,
    uint contractNo,
    address assignor,
    address assignee,
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
   * @param _assignor - address assigning tokens
   * @param _assignee - address receiving tokens
   * @param _price - price the assignee pays in Wei
   * @param _numTransferred - number of transferred shares
   */
  function recordAssignment(
    address _contract, 
    address _assignor, 
    address _assignee, 
    uint _price, 
    uint _numTransferred) public {
    Assignment memory _assignment = Assignment({
      assignor: _assignor,
      assignee: _assignee,
      price: _price,
      numTransferred: _numTransferred,
      confirmed: false
    });

    uint _assignmentNo = currAssignment[_contract]++;
    
    assignmentHistory[_contract][_assignmentNo] = _assignment;

    emit AssignmentExecuted(_contract, _assignmentNo, _assignor, _assignee, _price, _numTransferred);
  }

  function () external payable { }

/**
   * @notice executeAssignment is called by an assignor to effect token transfer after receiving payment 
   * @param _contract - the address of the tokenized ERC20 income shares 
   * @param _assignmentNum - the particular Assignment's index for retrieval 
   */
  function executeAssignment(address _contract, uint _assignmentNum) public {

    ProofClaim pcToken = ProofClaim(_contract);

    uint assignorTokens = pcToken.balanceOf(msg.sender);
    
    Assignment memory _assignment = assignmentHistory[_contract][_assignmentNum];

    require (msg.sender == _assignment.assignor, "only assignor can confirm");
    require (assignorTokens >= _assignment.numTransferred, "assignor does not have enough tokens to assign");

    // transfer pre-approved token balance from assignor to assignee by calling Token smart contract
    require(pcToken.transferFrom(_assignment.assignor, _assignment.assignee, _assignment.numTransferred), "transfer unsuccessful");

    _assignment.confirmed = true;

    // update the Assignment w/ confirmed = true
    assignmentHistory[_contract][_assignmentNum] = _assignment; 
  }

/**
   * @notice getNumAssignments returns the number of assignments made for a token  
   * @param _contract - the address of the tokenized ERC20 income shares 
   */
  function getNumAssignments(address _addr) public returns (uint) {
    return currAssignment[_addr];
  }

/**
   * @notice getAssignment returns the details of an Assignment 
   * @param _contract - the address of the tokenized ERC20 income shares 
   * @param _assignmentNum - the particular Assignment's index for retrieval 
   */
  function getAssignment(address _contract, uint _assignmentNum) public returns (  
    address assignor,
    address assignee,
    uint price,
    uint numTransferred,
    bool confirmed) {
    
    Assignment memory _assignment = assignmentHistory[_contract][_assignmentNum];
    assignor = _assignment.assignor;
    assignee = _assignment.assignee;
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