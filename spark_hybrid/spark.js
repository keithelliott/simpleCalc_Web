var querystring = require('querystring')
,		DEFAULT_AUTH_ENDPOINT = "https://sparkplatform.com/"
,		DEVELOPER_AUTH_ENDPOINT = "https://developers.sparkplatform.com/"
,		client_id
,		client_secret
,		oauth_redirect_url
,		oauth_access_token
,		oauth_refresh_token
,		oauth_grant_code
,		auth_mode
, 	developer_mode = true;

function Spark_Hybrid_Connect( clientid, clientsecret, redirect_url, accesstoken){
	this.client_id = clientid;
	this.client_secret = clientsecret;
	this.oauth_redirect_url = redirect_url;
	this.oauth_access_token = accesstoken;
	
};

function authentication_host(){
	if(this.developer_mode){
		return DEVELOPER_AUTH_ENDPOINT;
	}
	
	return DEFAULT_AUTH_ENDPOINT;
}

function authentication_endpoint_uri(additional_params){
		var params = {
			"openid.spark.combined_flow" : true,
			"openid.mode": "checkid_setup",
			"openid.spark.client_id"    : this.api_client_id,
			"openid.return_to" : this.oauth_redirect_uri
		};
		
		
		return this.authentication_host() + "openid?" + querystring.stringify(params));
}

