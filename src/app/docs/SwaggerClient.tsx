// src/app/docs/SwaggerClient.tsx
"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-dist/swagger-ui.css";

export default function SwaggerClient() {
	return (
		<div className='box'>
			<SwaggerUI url='/api/openapi' docExpansion='list' defaultModelsExpandDepth={-1} />
		</div>
	);
}
