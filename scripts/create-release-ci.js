// Import required modules
const fs = require('fs');
const { resolve } = require('path');
const yaml = require('yaml');

// Define a helper function to get the file path
const filePath = pathName => {
	if (pathName) {
		return resolve(process.cwd(), pathName);
	}

	return resolve(process.cwd());
};

// Define the release YAML configuration
var releaseYaml = {
	name: "Publish Release",

	on: {
		push: {
			"tags": ['*']
			// branches: ['dev', 'master']
		}
	},
	jobs: {
		release: {
			"runs-on": "ubuntu-18.04",
			steps: [
				{
					"uses": "actions/checkout@v2"
				},
				{
					"name": "Get release version",
					"id": "get_release_version",
					"run": "echo ::set-output name=VERSION::${GITHUB_REF#refs/tags/}"
				},
				{
					"name": "Configure AWS credentials",
					"uses": "aws-actions/configure-aws-credentials@v1",
					"with": {
						"aws-access-key-id": "${{ secrets.AWS_ACCESS_KEY_ID }}",
						"aws-secret-access-key": "${{ secrets.AWS_SECRET_ACCESS_KEY }}",
						"aws-region": "us-west-2"
					}
				},
			]
		}
	}
}

// Define the main function
var main = async () => {

	// Define the list of services
	const services = ['erxes', 'core', 'gateway', 'crons', 'workers', 'essyncer', 'widgets', 'client-portal'];

	// Define the list of plugins
	var plugins = [
		{ name: 'inbox', ui: true, api: true },
		{ name: 'automations', ui: true, api: true },
		{ name: 'calendar', ui: true },
		{ name: 'cards', ui: true, api: true },
		{ name: 'clientportal', ui: true, api: true },
		{ name: 'contacts', ui: true, api: true },
		{ name: 'dashboard', ui: true, api: true },
		{ name: 'emailtemplates', ui: true, api: true },
		{ name: 'engages', ui: true, api: true },
		{ name: 'forms', ui: true, api: true },
		{ name: 'integrations', api: true },
		{ name: 'internalnotes', api: true },
		{ name: 'knowledgebase', ui: true, api: true },
		{ name: 'logs', ui: true, api: true },
		{ name: 'loyalties', ui: true, api: true },
		{ name: 'notifications', ui: true, api: true },
		{ name: 'webhooks', ui: true, api: true },
		{ name: 'products', ui: true, api: true },
		{ name: 'segments', ui: true, api: true },
		{ name: 'tags', ui: true, api: true },
		{ name: 'webbuilder', ui: true, api: true },
  		{ name: 'documents', ui: true, api: true },
	];

	// Add plugin services to the list of services
	for (const plugin of plugins) {
		if (plugin.api) {
			services.push(`plugin-${plugin.name}-api`);
		}
	}

	// Loop through services and add steps to the release YAML configuration
	for (const service of services) {
		
		// Define the 'run' command for each service
		let run = "echo ${{ secrets.DOCKERHUB_TOKEN }} | docker login -u ${{ secrets.DOCKERHUB_USERNAME }} --password-stdin \n"
				+ `docker image pull erxes/${service}:dev \n`
				+ `docker tag erxes/${service}:dev erxes/${service}:\${GITHUB_REF#refs/tags/} \n`
				+ `docker push erxes/${service}:\${GITHUB_REF#refs/tags/} \n`;

		// Add additional command for 'erxes' service
		if (service === 'erxes') {
			run += `aws s3 cp s3://erxes-dev-plugins/locales.tar s3://erxes-release-plugins/\${GITHUB_REF#refs/tags/}/locales.tar \n`;
		}

		// Add the step to the release YAML configuration
		releaseYaml.jobs.release.steps.push({
			name: `${service}`,
			run
		})
	}

	// Loop through plugins and add steps to the release YAML configuration
	for (const plugin of plugins) {
		if (plugin.ui) {
			releaseYaml.jobs.release.steps.push({
				name: `${plugin.name} ui`,
				run: `aws s3 sync s3://erxes-dev-plugins/uis/plugin-${plugin.name}-ui s3://erxes-release-plugins/uis/plugin-${plugin.name}-ui/\${GITHUB_REF#refs/tags/}/`
			})
		}
	}

	// Convert the release YAML configuration to a string 
	const yamlString = yaml.stringify(releaseYaml);

	// Write the YAML string to the release.yaml file 
	fs.writeFileSync(filePath('.github/workflows/release.yaml'), yamlString);
}

// Call the main function
main();