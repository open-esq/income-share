pragma solidity ^0.5.0;

contract IncomeAssignment {
  address payable public assignor;
  address public assignee;
  address public tokenizedIncomeAddr;
  uint public price;
  bool public confirmed;

  function recordAssignment(address _tokenizedIncomeAddr, uint _price,
    address payable _assignor, address _assignee
  ) public {
    tokenizedIncomeAddr = _tokenizedIncomeAddr;
    price = _price;
    seller = _seller; 
    buyer = _buyer;
  }

  function () external payable { }

  function confirmReceipt() public payable {
    require(msg.sender == buyer, "only buyer can confirm");
    require(address(this).balance == price, "purchase price must be funded");
    address(seller).transfer(address(this).balance);
    confirmed = true;
    // function calling ProofClaim contract updating registry
  }
}
