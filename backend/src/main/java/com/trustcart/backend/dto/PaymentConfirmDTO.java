package com.trustcart.backend.dto;

public class PaymentConfirmDTO {

    private Long paymentId;
    private String paymentReferenceId;
    private String paymentMethod;
    private boolean simulatedSuccess = true;
    private String transactionNote;

    public PaymentConfirmDTO() {
    }

    public PaymentConfirmDTO(Long paymentId, String paymentReferenceId, boolean simulatedSuccess) {
        this.paymentId = paymentId;
        this.paymentReferenceId = paymentReferenceId;
        this.simulatedSuccess = simulatedSuccess;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public String getPaymentReferenceId() {
        return paymentReferenceId;
    }

    public void setPaymentReferenceId(String paymentReferenceId) {
        this.paymentReferenceId = paymentReferenceId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public boolean isSimulatedSuccess() {
        return simulatedSuccess;
    }

    public void setSimulatedSuccess(boolean simulatedSuccess) {
        this.simulatedSuccess = simulatedSuccess;
    }

    public String getTransactionNote() {
        return transactionNote;
    }

    public void setTransactionNote(String transactionNote) {
        this.transactionNote = transactionNote;
    }
}
