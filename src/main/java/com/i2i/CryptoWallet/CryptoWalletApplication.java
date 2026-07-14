package com.i2i.CryptoWallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CryptoWalletApplication {

	public static void main(String[] args) {
		// Force JVM to use system DNS
		System.setProperty("java.net.preferIPv4Stack", "true");
		System.setProperty("sun.net.spi.nameservice.provider.1", "default");
		System.setProperty("https.protocols", "TLSv1.2,TLSv1.3");
		System.setProperty("java.net.preferIPv4Stack", "true");
		SpringApplication.run(CryptoWalletApplication.class, args);
	}
}