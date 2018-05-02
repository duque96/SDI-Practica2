package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_RegisterView extends PO_NavView {
	static public void fillForm(WebDriver driver, String namep, String emailp, String passwordp, String passwordconfp) {
		WebElement name = driver.findElement(By.id("RegisterName"));
		name.click();
		name.clear();
		name.sendKeys(namep);
		WebElement lastname = driver.findElement(By.id("RegisterEmail"));
		lastname.click();
		lastname.clear();
		lastname.sendKeys(emailp);
		WebElement password = driver.findElement(By.id("RegisterPassword"));
		password.click();
		password.clear();
		password.sendKeys(passwordp);
		WebElement passwordConfirm = driver.findElement(By.id("RegisterPasswordConfirm"));
		passwordConfirm.click();
		passwordConfirm.clear();
		passwordConfirm.sendKeys(passwordconfp);
		// Pulsar el boton de Alta.
		By boton = By.id("RegisterSubmit");
		driver.findElement(boton).click();
	}
}
