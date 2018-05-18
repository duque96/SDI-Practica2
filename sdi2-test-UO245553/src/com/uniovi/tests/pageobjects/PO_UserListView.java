package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_UserListView extends PO_NavView {
	static public void fillForm(WebDriver driver, String searchText) {
		WebElement name = driver.findElement(By.id("search"));
		name.click();
		name.clear();
		name.sendKeys(searchText);
		// Pulsar el boton de Alta.
		By boton = By.id("searchSubmit");
		driver.findElement(boton).click();
	}

	static public void sendPetition(WebDriver driver) {
		// Pulsar el boton de Alta.
		By boton = By.id("btnAddFriend");
		driver.findElement(boton).click();
	}
}
