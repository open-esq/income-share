pragma solidity ^0.5.0;

contract IncomeAssignment {

  ProofClaim pcToken;

  // @notice Assignment defines details of an assignment
  struct Assignment {
    address assignor;
    address assignee;
    uint priceInEth;
    uint numTransferred;
    bool confirmed;
  }

  address owner;

  // @notice ERC20 address -> Assignment number -> Assignment
  mapping (address => mapping(uint => Assignment)) public assignmentHistory;

  // @notice ERC20 address -> Assignment index (defaults to 0)
  mapping (address => uint) public currAssignment; 

  constructor(address _pcTokenAddr) public {
    owner = msg.sender;
    pcToken = ProofClaim(_pcTokenAddr);
  }
  
  modifier onlyOwner(address _owner) {
    require (msg.sender == _owner);
    _;
  }

  function recordAssignment(
    address _contract, 
    address _assignor, 
    address _assignee, 
    uint _priceInEth, 
    uint _numTransferred) public onlyOwner (msg.sender) {
    Assignment memory _assignment = Assignment({
      assignor: _assignor,
      assignee: _assignee,
      priceInEth: _priceInEth,
      numTransferred: _numTransferred,
      confirmed: false
    });
    
    assignmentHistory[_contract][currAssignment[_contract]++] = _assignment;
  }

  function () external payable { }

  function executeAssignment(address _contract, uint _assignmentNum) public {

    uint assignorTokens = pcToken.balanceOf(msg.sender);
    Assignment memory _assignment = assignmentHistory[_contract][_assignmentNum];
    require (msg.sender == _assignment.assignor, "only assignor can confirm");
    require (assignorTokens >= _assignment.numTransferred, "assignor does not have enough tokens to assign");
    require(pcToken.transfer(_assignment.assignee, _assignment.numTransferred), "transfer unsuccessful");
    _assignment.confirmed = true;   

    // Save the record of the assignment
    assignmentHistory[_contract][_assignmentNum] = _assignment; 
  }

  function getNumAssignments(address _addr) public returns (uint) {
    return currAssignment[_addr];
  }
}

contract ProofClaim {
  
  function balanceOf(address tokenOwner) public view returns (uint balance) {}
    	
  function transfer(address to, uint tokens) public returns (bool success) {}
}